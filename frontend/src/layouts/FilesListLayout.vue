<template>
    <div>
        <div class="files">
            <FileListEntry :file="file" v-for="file in files"/>
        </div>
    </div>
</template>

<script>
    import * as firebase from 'firebase/app';
    import 'firebase/firestore';
    import {requireUser} from '../other/page-global';
    import FileListEntry from '../components/FileListEntry';

    export default {
        name: 'FilesListLayout',
        components: {FileListEntry},
        methods: {
            onGotFiles({empty, docs}) {
                this.isEmpty = empty;
                this.files = docs.map(e => ({...e.data(), id: e.id}));
            }
        },
        created() {
            requireUser(this)
                .then(user => {
                    const uid = user.uid;
                    return firebase
                        .firestore()
                        .collection('files')
                        .where('uid', '==', uid)
                        .orderBy('created', 'desc')
                        .onSnapshot(this.onGotFiles);
                });
        },
        destroyed() {
            if (this.unsub)
                this.unsub();
        },
        data() {
            return {
                unsub: null,
                isEmpty: false,
                files: []
            };
        }
    };
</script>

<style scoped>
    .files {
        border-radius: 6px;
        border: 1px solid #555;
        margin: 8px;
    }

    .files > * {
        transition: background-color .2s;
        border-bottom: 1px solid #555;
    }

    .files > *:hover {
        background-color: #ffffff11;
    }

    .files > *:last-child {
        border-bottom: none;
    }
</style>
