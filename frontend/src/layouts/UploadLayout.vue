<template>
    <div @dragover.prevent
         @drop.prevent="fileSelected" class="upload-layout" v-if="showLayout">

        <NiceInput
                :default-value="hash"
                :disabled="!!task"
                placeholder="Upload token"
                v-if="anonUpload"
                v-model="token"/>

        <NiceButton :disabled="!!task"
                    @click="selectFile"
                    icon="attachment"
                    title="Select file"/>

        <NiceInput :default-value="this.selectedFile ? this.selectedFile.name : ''"
                   :disabled="!!task"
                   @input="fileNameChanged"
                   placeholder="Name of this file"/>

        <div class="bottom-bar">
            <ProgressBar :enabled="!!task" :progress="progress"/>
            <NiceButton :disabled="!selectedFile || !fileName || (anonUpload && !token)"
                        :icon="task ? 'cancel' : 'upload'"
                        :title="task ? 'Cancel' : 'Upload'"
                        @click="uploadClick"/>
        </div>

        <p class="invalid-token-msg" v-if="invalidToken">Upload token is invalid</p>
        <p v-else-if="!finished && !task">Select or drop a file to upload</p>
        <p v-else-if="task && uploadEta > 0">
            Uploading a file {{Math.round(progress * 100)}}% ETA {{Math.round(uploadEta / 1000)}}s</p>
        <p v-else-if="task && uploadEta === -2">Finalizing...</p>
        <p v-else-if="task">Starting the upload</p>
        <p v-else-if="finished">File upload finished!</p>

    </div>
</template>

<script>
    import NiceButton from '../components/NiceButton';
    import {awaitUser, requireUser} from '../other/page-global';
    import * as firebase from 'firebase/app';
    import 'firebase/storage';
    import NiceInput from '../components/NiceInput';
    import ProgressBar from '../components/ProgressBar';

    export default {
        name: 'UploadLayout',
        components: {ProgressBar, NiceInput, NiceButton},
        props: {
            anonUpload: Boolean,
        },
        created() {
            this.token = this.hash = this.$route.hash.substr(1);
            if (this.anonUpload)
                awaitUser().finally(() => this.showLayout = true);
            else
                requireUser(this).then(u => {
                    this.uid = u.uid;
                    this.showLayout = true;
                });
        },
        destroyed() {
            if (this.task)
                this.task.cancel();
            clearInterval(this.updateEtaInterval);
        },
        methods: {
            selectFile() {
                const input = document.createElement('input');
                input.type = 'file';
                input.onchange = this.fileSelected;
                input.click();
            },
            fileSelected(event) {
                if (this.task) return;
                this.selectedFile = event.target.files ? event.target.files[0] : (event.dataTransfer ? event.dataTransfer.files[0] : null);
                this.fileName = this.selectedFile ? this.selectedFile.name : this.fileName;
            },
            fileNameChanged(value) {
                this.fileName = value;
            },
            uploadClick() {
                if (this.task) {
                    // cancel
                    this.task.cancel();
                } else {
                    if ((this.anonUpload && !this.token) || !this.selectedFile)
                        return;
                    this.startUploading();
                }
            },
            startUploading() {
                let type = this.selectedFile.type;
                if (type.includes('/'))
                    type = type.substr(0, type.indexOf('/'));
                if (!['text', 'audio', 'video', 'image'].includes(type))
                    type = 'other';

                this.uploadEta = 0;
                this.invalidToken = false;
                const storage = firebase.storage();
                const fileRef = this.anonUpload ?
                    storage
                        .ref('anon-files')
                        .child(this.token)
                    : storage
                        .ref('files-in-progress')
                        .child(this.uid)
                        .child(`${Date.now()}${Math.random() * 100000}`);

                const task = this.task = fileRef.put(this.selectedFile, {
                    customMetadata: {
                        name: this.fileName,
                        type: type,
                    }
                });

                task.on(firebase.storage.TaskEvent.STATE_CHANGED, this.onUploadProgress);
                task.then(this.onUploadFinished);
                task.catch(this.onUploadError);
                this.updateEtaInterval = setInterval(this.updateEta, 2000);
            },
            updateEta() {
                if (!this.task) return;
                if (this.uploadEta === 0)
                    this.uploadStartTime = Date.now();

                const snapshot = this.task.snapshot;
                if (snapshot.totalBytes === snapshot.bytesTransferred) {
                    this.uploadEta = -2;
                    return;
                }
                const duration = Date.now() - this.uploadStartTime;
                if (duration <= 0) {
                    this.uploadEta = -1;
                    return;
                }
                const speed = snapshot.bytesTransferred / duration; //bytes per millisecond
                this.uploadEta = (snapshot.totalBytes - snapshot.bytesTransferred) / speed;
            },
            onUploadProgress(snapshot) {
                this.progress = snapshot.bytesTransferred / snapshot.totalBytes;
            },
            onUploadFinished() {
                this.task = null;
                this.finished = true;
                clearInterval(this.updateEtaInterval);
            },
            onUploadError(error) {
                clearInterval(this.updateEtaInterval);
                this.task = null;
                if (error.code === 'storage/canceled')
                    return;
                if (error.code === 'storage/unauthorized' && this.anonUpload) {
                    this.invalidToken = true;
                    return;
                }
                alert(error.message);
            }
        },
        data() {
            return {
                showLayout: false,
                uid: null,
                selectedFile: null,
                hash: null,
                task: null,
                defaultFileName: null,
                finished: false,
                progress: 0,
                fileName: '',
                uploadStartTime: 0,
                uploadEta: 0,
                token: '',
                invalidToken: false,
            };
        }
    };
</script>

<style scoped>

    .upload-layout {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding: 8px;
        animation: FadeIn .3s;
    }

    .upload-layout > * {
        width: 80%;
        margin: 8px;
    }

    /*.drag-handler {*/
    /*    top: 0;*/
    /*    left: 0;*/
    /*    width: 100%;*/
    /*    height: 100%;*/
    /*    margin: 0;*/
    /*    padding: 0;*/
    /*    background: #00000055;*/
    /*    position: absolute;*/
    /*}*/

    .bottom-bar {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .bottom-bar > :first-child {
        flex: 1;
    }

    .bottom-bar > :last-child {
        max-width: 150px;
    }

    .invalid-token-msg {
        color: red;
        font-weight: bold;
    }
</style>
