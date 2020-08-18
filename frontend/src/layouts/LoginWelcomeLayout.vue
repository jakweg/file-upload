<template>
    <div>
        <h3>Please sign in to continue</h3>

        <NiceButton :disabled="working"
                    @click="signInViaGoogle"
                    icon="login"
                    title="Sign in with Google"/>

        <NiceButton icon="cloud-upload"
                    title="Upload via token"
                    to="/token-upload"/>
    </div>
</template>

<script>
    import NiceButton from '../components/NiceButton';
    import * as firebase from 'firebase/app';

    export default {
        name: 'LoginWelcomeView',
        components: {NiceButton},
        created() {
            this.sub = firebase.auth().onAuthStateChanged(user => {
                if (user) this.$router.push({path: '/'});
            });
        },
        destroyed() {
            this.sub();
        },
        methods: {
            signInViaGoogle() {
                this.working = true;
                const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

                (isTouchDevice ? this.auth.signInWithRedirect(this.provider) : this.auth.signInWithPopup(this.provider))
                    .then(() => this.$router.push({path: '/'}))
                    .catch(e => alert(e.message))
                    .finally(() => this.working = false);
            }
        },
        data() {
            return {
                working: false,
                auth: firebase.auth(),
                provider: new firebase.auth.GoogleAuthProvider()
            };
        }
    };
</script>

<style scoped>

</style>
