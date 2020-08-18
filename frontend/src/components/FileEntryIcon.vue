<template>
    <LazyImage :file="'/assets/file-' + type + '.svg'" :size="size"/>
</template>

<script>
    import LazyImage from './LazyImage';

    export default {
        name: 'FileEntryIcon',
        components: {LazyImage},
        props: {
            type: {
                required: true,
                type: String,
                default: 'other',
            },
            size: {
                type: String,
                default: '24px',
            }
        }
    };
</script>

<style scoped>

</style>
