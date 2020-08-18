<template>
    <div class="bar">
        <div :class="{enabled}"
             :style="{width: `${progress * 100|0}%`}"
             class="progress"></div>
    </div>
</template>

<script>
    export default {
        name: 'ProgressBar',
        props: {
            enabled: Boolean,
            progress: {
                required: true,
                type: Number,
            }
        },
        watch: {
            progress() {

            }
        }
    };
</script>

<!--suppress CssUnusedSymbol -->
<style scoped>
    .bar {
        --HEIGHT: 32px;
        height: var(--HEIGHT);
        background-color: #0c0c2a;
        border-radius: 12px;
        display: block;
        width: 100%;
        box-sizing: border-box;
        position: relative;
    }

    .progress {
        transition: opacity .3s, width .2s;
        opacity: 0;
        background-color: #212186;
        border-radius: 12px;
        height: var(--HEIGHT);
        min-width: var(--HEIGHT);
    }

    .progress.enabled {
        opacity: 1;
    }
</style>
