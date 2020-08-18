<template>
    <div :class="{faded: status === 'loading'}" class="token-layout">

        <h2>Your active token is:</h2>
        <h1>{{currentToken || 'xxxx'}}</h1>
        <p>It will expire when used or after {{Math.max(0, expireIn)}} seconds</p>

        <div>
            <NiceButton @click="copyLink"
                        icon="copy"
                        title="Copy link"/>

            <NiceButton @click="shareLink"
                        icon="share"
                        title="Share"
                        v-if="shareAvailable"/>

            <NiceButton @click="deleteToken"
                        icon="cancel"
                        title="Invalidate this token"/>
        </div>

        <div :class="{faded: status !== 'disabled'}"
             class="above-token-layout">

            <h2>Click below to generate a token</h2>
            <NiceButton
                    :disabled="working"
                    @click="requestNewToken"
                    icon="update"
                    title="Request a token"/>
        </div>

        <div :class="{faded: !(status === 'active' && expireIn === 0)}"
             class="above-token-layout">

            <h2>Token expired</h2>
            <NiceButton
                    :disabled="working"
                    @click="refreshToken"
                    icon="update"
                    title="Request a new one"/>
        </div>

        <div :class="{faded: status !== 'used'}"
             class="above-token-layout">

            <h2>Token has been used</h2>
            <h4>Uploaded file {{uploadedFileName}}</h4>
            <NiceButton
                    icon="policy"
                    title="Go to files"
                    to="/files"/>

            <NiceButton
                    :disabled="working"
                    @click="deleteToken"
                    icon="update"
                    title="Forget this one"/>
        </div>

        <div :class="{faded: status !== 'requested'}"
             class="above-token-layout">

            <h2>Waiting for new token</h2>
        </div>
    </div>
</template>

<script>
    import * as firebase from 'firebase/app';
    import 'firebase/firestore';
    import {requireUser} from '../other/page-global';
    import NiceButton from '../components/NiceButton';

    export default {
        name: 'ShowUploadTokenLayout',
        components: {NiceButton},
        created() {
            requireUser(this)
                .then(user => {
                    this.working = true;
                    this.uid = user.uid;
                    const myTokenDoc = this.myTokenDoc = firebase
                        .firestore()
                        .collection('user-tokens')
                        .doc(user.uid);

                    this.tokenSub = myTokenDoc.onSnapshot(this.onMyTokenDocSnapshot);
                });
            this.expireTimer = setInterval(() => {
                this.expireIn = Math.trunc((Math.max(0, this.expiresAt - Date.now())) / 1000);
            }, 1000);
        },
        destroyed() {
            if (this.tokenSub)
                this.tokenSub();
            clearInterval(this.expireTimer);
        },
        methods: {
            onMyTokenDocSnapshot(snap) {
                const exists = snap.exists;
                const data = snap.data();
                this.working = false;
                if (!exists || !data) {
                    this.status = 'disabled';
                    this.uploadedFileName = this.currentToken = null;
                    this.expireIn = 0;
                    return;
                }

                this.expiresAt = data.expires ? data.expires.toMillis() : 0;
                this.expireIn = -1;
                this.status = data.status || 'unknown';
                this.uploadedFileName = data.fileName;
                this.currentToken = data.token;
            },
            async requestNewToken() {
                try {
                    this.working = true;
                    await this.myTokenDoc.set({
                        status: 'requested',
                    });
                } catch (e) {
                    console.error(e.message);
                }
                this.working = false;
            },
            async deleteToken() {
                try {
                    this.working = true;
                    await this.myTokenDoc.delete();
                } catch (e) {
                    console.error(e.message);
                }
                this.working = false;
            },
            async refreshToken() {
                await this.deleteToken();
                await this.requestNewToken();
            },
            shareLink() {
                navigator.share({
                    title: `${this.currentToken} is the upload token`,
                    text: `Your token is ${this.currentToken}, use it to upload a file`,
                    url: `${location.origin}/token-upload#${this.currentToken}`
                });
            },
            copyLink() {
                navigator.clipboard.writeText(`${location.origin}/token-upload#${this.currentToken}`);
            }
        },
        data() {
            return {
                uid: null,
                status: 'loading',
                working: true,
                myTokenDoc: null,
                tokenSub: null,
                currentToken: null,
                expireIn: -1,
                expiresAt: null,
                shareAvailable: !!navigator.share,
                expireTimer: null,
                uploadedFileName: null,
            };
        },
    };
</script>

<style scoped>
    .token-layout {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        min-height: 300px;
    }

    @media (max-width: 600px) {
        .token-layout {
            min-height: calc(100vh - 60px);
        }
    }

    h1 {
        font-size: 3em;
        margin: 8px;
        user-select: all;
        letter-spacing: 4px;
    }

    h4 {
        margin: 4px;
    }

    .above-token-layout {
        transition: opacity .3s;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0c0c2aee;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    @media (min-width: 600px) {
        .above-token-layout {
            border-radius: 16px;
        }
    }
</style>
