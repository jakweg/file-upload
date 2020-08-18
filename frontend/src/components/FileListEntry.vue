<template>
    <router-link :to="'/files/' + file.id">
        <FileEntryIcon :type="file.type" class="icon" size="32px"/>
        <LazyImage class="icon" file="/assets/public.svg" size="32px" title="This file is accessible publicly"
                   v-if="file.public"/>
        <p class="name">{{file.name}}</p>
        <p class="size">{{formattedSize}}</p>
    </router-link>
</template>

<script>
    import FileEntryIcon from './FileEntryIcon';
    import {formatSize} from '../other/page-global';
    import LazyImage from './LazyImage';

    export default {
        name: 'FileListEntry',
        components: {LazyImage, FileEntryIcon},
        props: {
            file: {
                type: Object,
                required: true
            }
        },
        watch: {
            file() {
                this.formattedSize = formatSize(this.file.size);
            }
        },
        data() {
            return {
                formattedSize: this.file ? formatSize(this.file.size) : ''
            };
        }
    };
</script>

<style scoped>
    a {
        padding: 4px;
        align-items: center;
        display: flex;
        text-decoration: none;
        color: white;
    }

    a > * {
        padding: 4px;
        margin: 2px;
    }

    .icon {

    }

    .name {
        word-break: break-all;
        flex: 1;
        font-size: 1.1em;
        max-height: 3.3em;
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .size {
        max-width: 80px;
        flex: 1;
    }
</style>
