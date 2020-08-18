<template>
    <!--suppress HtmlUnknownAttribute, HtmlUnknownTarget -->
    <img :alt=alt
         :class="{invert}"
         :height="size"
         :src="file"
         :width="size"
         @click="$emit('click', $event)"
         @load="done"
         loading="lazy" style="opacity: 0">
</template>

<script>
    export default {
        name: 'LazyImage',
        props: {
            file: String,
            alt: String,
            size: String,
            invert: Boolean
        },
        methods: {
            done(event) {
                event.target.style.opacity = null;
            }
        }
    };
</script>

<!--suppress CssUnusedSymbol -->
<style scoped>
    @media (prefers-reduced-motion: no-preference) {
        img {
            transition: opacity .3s, filter .3s;
        }
    }

    .invert {
        filter: invert(1);
    }
</style>
