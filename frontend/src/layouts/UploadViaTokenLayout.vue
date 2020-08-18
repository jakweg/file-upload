<template>
    <div>
        <!--        <NiceButton @click="selectFile" title="Select button"/>-->
        <!--        <NiceButton @click="startUploading" title="Start uploading"/>-->
        <UploadLayout anon-upload/>
    </div>
</template>

<script>
    import NiceInput from '../components/NiceInput';
    import NiceButton from '../components/NiceButton';
    import * as firebase from 'firebase/app';
    import 'firebase/storage';
    import UploadLayout from './UploadLayout';

    export default {
        name: 'UploadViaTokenLayout',
        components: {UploadLayout, NiceButton, NiceInput},
        methods: {
            tokenEdited(value) {
                this.token = value;
            },
            selectFile() {
                const input = document.createElement('input');
                input.type = 'file';
                input.onchange = this.fileSelected;
                input.click();
            },
            fileSelected(event) {
                this.selectedFile = event.target.files ? event.target.files[0] : null;
                this.fileName = this.selectedFile ? this.selectedFile.name : this.fileName;
            },
            async startUploading() {
                try {
                    console.log('starting', this.token, this.fileName, this.selectedFile);
                    const fileRef = firebase
                        .storage()
                        .ref('anon-files')
                        .child(this.token);


                    await fileRef.put(this.selectedFile, {
                        customMetadata: {
                            name: 'raz dwa trzy'
                        }
                    });
                    console.log('finished');
                } catch (e) {
                    console.error(e);
                }
            }
        },
        data() {
            return {
                token: null,
                selectedFile: null,
            };
        }
    };
</script>

<style scoped>

</style>
