<template>
    <div :style="{'max-height': isFullscreen ? 'unset' : null}"
         @dblclick="fullscreenClick"
         class="image">

        <img :class="{loaded}"
             :src="src"
             @error="load"
             @load="load"
             alt="Big image">

        <div :class="{'disappear-box-enabled': isFullscreen}" class="disappear-box">
            <NiceButton :icon="isFullscreen ? 'fullscreen-exit' : 'fullscreen'"
                        @click="fullscreenClick"
                        class="btn"
                        title=""
                        v-if="canFullscreen && loaded"/>
        </div>
    </div>
</template>

<script>
    import LazyImage from './LazyImage';
    import NiceButton from './NiceButton';

    export default {
        name: 'FullscreenableImage',
        components: {NiceButton, LazyImage},
        props: {
            src: {
                type: String,
                required: true,
            }
        },
        created() {
            document.addEventListener('fullscreenchange', this.fullScreenChanged);
        },
        destroyed() {
            document.removeEventListener('fullscreenchange', this.fullScreenChanged);
        },
        data() {
            return {
                loaded: false,
                canFullscreen: document.fullscreenEnabled,
                isFullscreen: !!document.fullscreenElement
            };
        },
        methods: {
            fullScreenChanged() {
                this.isFullscreen = !!document.fullscreenElement;
            },
            fullscreenClick({target}) {
                if (this.isFullscreen) {
                    this.isFullscreen = false;
                    document.exitFullscreen();
                } else {
                    while (!target.classList.contains('image')) {
                        target = target.parentNode;
                    }
                    if (!target) return;
                    // noinspection JSUnresolvedFunction
                    target.requestFullscreen()
                          .then(() => this.isFullscreen = true)
                          .catch(() => this.isFullscreen = false);
                }
            },
            load() {
                this.loaded = true;
            },
        }
    };
</script>

<!--suppress CssUnusedSymbol -->
<style scoped>
    .image {
        position: relative;
        overflow: auto;
        max-height: 500px;
    }

    img {
        margin: 0 auto;
        opacity: 0;
        transition: opacity .5s;
    }

    .loaded {
        opacity: 1;
    }

    .btn {
        box-shadow: 2px 1px 4px #00000088;
    }

    .disappear-box {
        display: inline;
        position: absolute;
        z-index: 10;
        top: 0;
        right: 0;
        transition: opacity 2s ease-in 2s;
        opacity: 1;
    }

    .disappear-box-enabled {
        opacity: 0;
    }

    .disappear-box-enabled:hover {
        opacity: 1;
        transition: opacity .2s;
    }
</style>
