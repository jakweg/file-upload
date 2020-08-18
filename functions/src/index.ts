import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

const isDev = process.env.FUNCTIONS_EMULATOR === 'true'

if (!isDev)
	admin.initializeApp()
else
	admin.initializeApp({
		credential: admin.credential.cert(require('/home/jakub/Dokumenty/up-box-firebase-adminsdk.json')),
		databaseURL: 'https://up-box.firebaseio.com',
		storageBucket: 'up-box.appspot.com',
	})

export const createContentDispositionHeader = (userFileName: string) => 'attachment;filename*=UTF-8\'\'' + encodeURIComponent(userFileName) + ';'

const onFileInUsersDirectoryUploaded = async (fullPath: string,
                                              uid: string,
                                              name: string | undefined,
                                              type: string | undefined,
                                              size: number) => {
	functions.logger.info({uid})
	const userFileName = name || 'unknown file'
	let userFileType = type || ''
	if (!['text', 'audio', 'video', 'image'].includes(userFileType))
		userFileType = 'other'

	const metadata = {
		name: userFileName,
		public: 'false',
		uid,
		expires: null,
	}

	const updateMetadataPromise = admin
		.storage()
		.bucket()
		.file(fullPath)
		.setMetadata({
			cacheControl: 'no-cache;must-revalidate',
			contentType: 'application/octet-stream',
			contentDisposition: createContentDispositionHeader(userFileName),
			metadata,
			customMetadata: metadata,
		})

	const createdDocument = await admin
		.firestore()
		.collection('files')
		.add({
			uid,
			public: false,
			name: userFileName,
			type: userFileType,
			created: admin.firestore.FieldValue.serverTimestamp(),
			size: size,
		})

	await updateMetadataPromise

	await admin
		.storage()
		.bucket()
		.file(fullPath)
		.move('users-files/' + createdDocument.id)
}

// noinspection JSUnusedGlobalSymbols
export const onFileUploaded = functions.storage.bucket().object()
	.onFinalize(async (object) => {
		const fullPath = object.name
		if (!fullPath) return null
		const pathSplits = fullPath.split('/')
		if (pathSplits.length < 2) return
		if (fullPath.startsWith('files-in-progress/')) {
			const uid = pathSplits[1]
			await onFileInUsersDirectoryUploaded(fullPath, uid, object.metadata?.name, object.metadata?.type, +object.size)

		} else if (fullPath.startsWith('anon-files/') && object.metadata && object.metadata.name) {

			const token = pathSplits[1]
			const docs = await admin.firestore()
				.collection('user-tokens')
				.where('token', '==', token)
				.where('status', '==', 'active')
				.limit(1)
				.get()

			if (docs.empty) {
				// token was used by other upload or user cancelled during upload, so delete the file
				await admin.storage().bucket().file(fullPath).delete()
			} else {
				const doc = docs.docs[0]
				// const data = doc.data()
				const uid = doc.id
				const updatePromise = doc.ref.update({
					status: 'used',
					fileName: object.metadata?.name || object.md5Hash || null,
				})

				await onFileInUsersDirectoryUploaded(fullPath, uid, object.metadata?.name, object.metadata?.type, +object.size)
				await updatePromise
			}
		}

		return null
	})


// noinspection JSUnusedGlobalSymbols
export const onFileDbEntryDeleted = functions.firestore
	.document('files/{fileId}')
	.onDelete(async (snapshot, context) => {
		const fileId = context.params.fileId
		if (!fileId) return
		try {
			await admin
				.storage()
				.bucket()
				.file(`users-files/${fileId}`)
				.delete()
		} catch (e) {
			//ignore
		}
	})


// noinspection JSUnusedGlobalSymbols
export const onFileDbEntryUpdated = functions.firestore
	.document('files/{fileId}')
	.onUpdate(async (snapshot, context) => {
		const fileId = context.params.fileId
		if (!fileId) return

		const dataBefore = snapshot.before.data()
		const dataAfter = snapshot.after.data()

		const wasPublic = !!dataBefore.public
		const willBePublic = !!dataAfter.public

		const previousName = dataBefore.name
		const nextName = dataAfter.name

		if (wasPublic === willBePublic && previousName === nextName) return

		const file = admin
			.storage()
			.bucket()
			.file(`users-files/${fileId}`)

		const metadata = {
			name: nextName,
			public: willBePublic ? 'true' : 'false',
			uid: willBePublic ? null : dataAfter.uid,
			firebaseStorageDownloadTokens: willBePublic ? undefined : null,
		}

		await file.setMetadata({
			contentDisposition: createContentDispositionHeader(nextName),
			metadata, customMetadata: metadata,
		})
	})

// noinspection JSUnusedGlobalSymbols
export const onUserDeleted = functions.auth
	.user().onDelete(async user => {
		const uid = user.uid
		const files = await admin
			.firestore()
			.collection('files')
			.where('uid', '==', uid)
			.get()

		await Promise.all(files.docs.map(e => e.ref.delete()))
		await admin.firestore().collection('user-tokens').doc(uid).delete()
	})


// noinspection JSUnusedGlobalSymbols
export const onUserTokenCreated = functions.firestore
	.document('/user-tokens/{uid}')
	.onCreate(async (snapshot, context) => {
		const uid = context.params.uid
		const TOKEN_LENGTH = 4
		const TOKEN_EXPIRE_AFTER_MILLIS = 5 * 60 * 1000

		const randomizeToken = () => {
			const numbers = []
			for (let i = TOKEN_LENGTH - 1; i >= 0; i--)
				numbers[i] = Math.random() * 10 | 0
			return numbers.join('')
		}

		const createEmptyFile = (filePath: string, metadata: any) => new Promise((resolve, reject) => {
			const file = admin.storage().bucket().file(filePath)
			const stream = file.createWriteStream()
			stream.write('\0')
			stream.end(() => {
				file.setMetadata({
					customMetadata: metadata,
					metadata,
				}).then(resolve).catch(reject)
			})
		})

		const firestore = admin.firestore()
		const tokensCollection = firestore.collection('tokens')

		let randomToken
		let tokenDoc
		let exists = false
		do {
			randomToken = randomizeToken()
			tokenDoc = tokensCollection.doc(randomToken)
			try {
				const doc = await tokenDoc.get()
				const data = doc.data()

				exists = !(!doc.exists || !data)
			} catch (e) {
				exists = false
			}
		} while (exists)


		const expires = new Date(Date.now() + TOKEN_EXPIRE_AFTER_MILLIS)
		await Promise.all([
			tokenDoc.set({uid, expires}),
			createEmptyFile(`anon-files/${randomToken}`, {expires: expires.getTime().toString()}),
			snapshot.ref.update({status: 'active', expires, token: randomToken}),
		])
	})


// noinspection JSUnusedGlobalSymbols
export const onUserTokenDeleted = functions.firestore
	.document('/user-tokens/{uid}')
	.onDelete(async (snapshot) => {
		const data = snapshot.data()
		const token = data.token
		if (!token)
			return
		const tokenDoc = snapshot.ref.firestore.collection('tokens').doc(token)
		const fileRef = admin
			.storage()
			.bucket()
			.file(`anon-files/${token}`)

		await Promise.all([
			tokenDoc.delete(),
			fileRef.delete(),
		])
	})
