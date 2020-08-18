<template>
    <div class="buttons">
        <HomeButton icon="upload" title="Upload file" to="/upload"/>
        <HomeButton icon="token" title="Your token" to="/token"/>
        <HomeButton icon="dns" title="Uploaded files" to="/files"/>
        <hr class="signOutHr">
        <HomeButton @click.prevent="signOut" icon="login" title="Sign out" to=""/>
    </div>


    <!--    <NiceButton icon="upload" title="Upload new file" to="/upload"/>-->
    <!--    <NiceButton icon="token" title="Use you token" to="/token"/>-->
    <!--    <NiceButton icon="dns" title="See your uploaded files" to="/files"/>-->
    <!--    <NiceButton @click="signOut" title="Sign out"/>-->
</template>

<script>
    import * as firebase from 'firebase/app';
    import 'firebase/storage';
    import {fadeOutPage, requireUser} from '../other/page-global';
    import HomeButton from '../components/HomeButton';

    export default {
        name: 'HomeLayout',
        components: {HomeButton},
        created() {
            requireUser(this);
        },
        methods: {
            signOut() {
                if (confirm('Are you sure you want to sign out?'))
                    fadeOutPage().then(() => {
                        firebase.auth().signOut();
                        this.$router.push({path: '/login'});
                    });

            },
        },
    };
</script>

<style scoped>


    .buttons {
        display: block;
        padding: 4px;
    }

    @media (min-height: 600px) {
        .buttons {
            display: grid;
            grid-gap: 10px;
            grid-template-columns: 1fr 1fr;
        }

        .signOutHr {
            display: none;
        }
    }
</style>
