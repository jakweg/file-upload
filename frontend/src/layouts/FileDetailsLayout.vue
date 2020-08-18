<!--suppress ALL -->
<template>
    <div class="not-exists-layout" v-if="!exists">
        <h3>Sorry buddy, but this file doesn't exist or you just don't have permission to access it</h3>
        <NiceButton icon="login" title="Sign in" to="/login"/>
        <NiceButton icon="home" title="Go home" to="/"/>
    </div>
    <h3 class="loading-layout" v-else-if="loading">Fetching this data...</h3>
    <div class="details" v-else>
        <NiceInput :default-value="fileName"
                   :read-only="!entry"
                   @input="nameChanged"
                   class="input"
                   placeholder="File name"/>

        <NiceButton
                :disabled="!canShare"
                @click="share"
                class="with-fade-in"
                icon="share"
                title="Share link"
                v-if="!entry || entry.public"/>

        <NiceButton
                :icon="entry.public ? 'private' : 'public'"
                :title="entry.public ? 'Make private' : 'Make public '"
                @click="changeVisibility"
                v-if="entry"/>


        <NiceButton :to="downloadLink"
                    external-site
                    icon="download"
                    title="Download this file"/>

        <NiceButton
                :disabled="deleteDisabled"
                :red="confirmDeletion"
                :title="confirmDeletion ? 'Sure? ' : 'Delete'"
                @click="deleteClicked"
                icon="delete"
                v-if="entry"/>

        <NiceButton
                :disabled="updatingName"
                @click="updateNameClick"
                class="with-fade-in"
                icon="update"
                title="Update name"
                v-if="entry && newFileName !== fileName"/>


        <div class="preview-box" v-if="previewAvailable">
            <NiceButton :class="{'fade-out': aboutToShowPreview}"
                        :disabled="aboutToShowPreview"
                        @click="showPreview"
                        class="show-preview-btn"
                        icon="preview"
                        title="Show this file"
                        v-if="!showingPreview"/>

            <div class="preview" v-if="aboutToShowPreview">
                <video :src="downloadLink" autoplay controls v-if="fileType === 'video'"></video>
                <audio :src="downloadLink" autoplay controls v-else-if="fileType === 'audio'"></audio>
                <FullscreenableImage :src="downloadLink" v-else-if="fileType === 'image'"/>
            </div>
        </div>
    </div>
</template>
<script>
    import * as firebase from 'firebase/app';
    import 'firebase/firestore';
    import 'firebase/storage';
    import NiceButton from '../components/NiceButton';
    import NiceInput from '../components/NiceInput';
    import LazyImage from '../components/LazyImage';
    import FullscreenableImage from '../components/FullscreenableImage';
    import {awaitUser, delay} from '../other/page-global';

    export default {
        name: 'FileDetailsLayout',
        components: {FullscreenableImage, LazyImage, NiceInput, NiceButton},
        data() {
            return {
                loading: true,
                fileId: null,
                exists: true,
                downloadLink: null,
                entry: null,
                fileName: null,
                newFileName: null,
                fileType: null,
                previewAvailable: false,
                showingPreview: false,
                aboutToShowPreview: false,
                confirmDeletion: false,
                deleteDisabled: false,
                updatingName: false,
                canShare: !!navigator.share
            };
        },
        created() {
            this.fileId = this.$route.params.fileId;
            if (!this.fileId || this.fileId.includes('/'))
                return this.onFileNoExists();

            awaitUser().finally(this.loadFileData);
        },
        methods: {
            share() {
                this.canShare = false;
                navigator.share({
                    text: 'Here you\'ve got ' + this.fileName,
                    title: this.fileName,
                    url: window.location.href
                }).finally(() => this.canShare = true);
            },
            async updateNameClick() {
                this.updatingName = true;
                await firebase
                    .firestore()
                    .collection('files')
                    .doc(this.fileId)
                    .update({name: this.newFileName});

                await this.refreshDownloadLink();
                this.updatingName = false;
                this.fileName = this.newFileName;
            },
            async refreshDownloadLink() {
                await delay(5000);
                this.downloadLink = await firebase
                    .storage()
                    .ref(`users-files/${this.fileId}`)
                    .getDownloadURL();
            },
            changeVisibility() {
                this.entry.public = !this.entry.public;
                firebase.firestore()
                        .collection('files')
                        .doc(this.fileId)
                        .update({public: this.entry.public});
                this.refreshDownloadLink();
            },
            deleteClicked() {
                this.deleteDisabled = true;

                if (!this.confirmDeletion) {
                    this.confirmDeletion = true;
                    setTimeout(() => this.deleteDisabled = false, 1000);
                    return;
                }

                firebase
                    .firestore()
                    .collection('files')
                    .doc(this.fileId)
                    .delete()
                    .then(() => this.$router.back())
                    .catch(e => alert('Cannot delete: ' + e.message));
            },
            nameChanged(value) {
                this.newFileName = value;
            },
            onFileNoExists() {
                this.exists = false;
            },
            showPreview() {
                if (!this.downloadLink
                    || !this.previewAvailable
                    || this.aboutToShowPreview
                    || this.showingPreview)
                    return;

                this.aboutToShowPreview = true;
                setTimeout(() => {
                    this.showingPreview = true;
                }, 1000);
            },
            async loadFileData() {
                try {
                    const file = firebase
                        .storage()
                        .ref(`users-files/${this.fileId}`);

                    this.downloadLink = await file.getDownloadURL();

                    // if we are here then we have permissions to see this file
                    this.exists = true;

                    try {
                        this.entry = (await firebase
                            .firestore()
                            .collection('files')
                            .doc(this.fileId)
                            .get()).data();

                        this.fileName = this.entry.name;
                        this.fileType = this.entry.type;
                    } catch (e) {
                        // file is not mine :/ ignore error, try to fetch metadata instead

                        const metadata = await file.getMetadata();
                        this.fileName = metadata.customMetadata.name;
                        this.fileType = metadata.customMetadata.type;
                    }

                    this.newFileName = this.fileName;
                    this.previewAvailable = ['image', 'audio', 'video',].includes(this.fileType);


                } catch (e) {
                    this.exists = false;
                    if (e.code === 'object-not-found' || e.code === 'storage/unauthorized')
                        return this.onFileNoExists();
                    alert(e.message);
                } finally {
                    this.loading = false;
                }
            }
        }
    };
</script>

<style scoped>
    .details, .not-exists-layout {
        padding: 8px;
        animation: FadeIn .5s;
    }

    .input {
        font-size: 1.4em;
    }

    @media (prefers-reduced-motion: no-preference) {
        @keyframes VideoFocus {
            from {
                border-color: #eeeeee44;
            }
            to {
                border-color: #eeeeeeff;
            }
        }

        @keyframes Blinking {
            from {
                opacity: .3;
            }
            to {
                opacity: 1;
            }
        }

        .loading-layout {
            animation: Blinking infinite alternate 2s;
        }
    }

    video:not(:fullscreen):focus {
        outline: none;
        border: 2px solid #eee;
        animation: VideoFocus infinite 2s alternate ease-in-out;
    }

    video:not(:fullscreen) {
        border: 2px solid black;
        box-sizing: border-box;
        width: 100%;
        border-radius: 8px;
        max-height: 600px;
    }

    audio {
        flex: 1;
    }

    .preview-box {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 300px;
    }

    @media (max-width: 600px) {
        .details {
            padding: 0;
            height: calc(100vh - 60px);
            overflow: scroll;
        }

        .preview-box {
            min-height: 70vh;
        }
    }


    .show-preview-btn {
        position: absolute;
        opacity: 1;
        transition: opacity 1s;
    }

    .preview {
        overflow: auto;
        animation: FadeIn 1s;
    }

    .fade-out {
        opacity: 0;
        pointer-events: none;
    }

    .with-fade-in {
        animation: FadeIn .5s;
    }
</style>
