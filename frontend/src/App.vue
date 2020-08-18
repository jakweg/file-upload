<template>
    <div id="app">
        <PageHeader/>
        <main :class="{faded}">
            <router-view></router-view>
        </main>
    </div>
</template>
<script>
    import 'firebase/auth';
    import PageHeader from './components/PageHeader';
    import {setFadeOutListener, setOnAuthReadyListener} from './other/page-global';

    export default {
        name: 'App',
        components: {PageHeader},
        created() {
            setFadeOutListener(this.onFadeOut.bind(this));
            setOnAuthReadyListener(() => {
                this.onFadeOut(false);
            });
        },
        data() {
            return {
                faded: true,
                ready: false,
            };
        },
        methods: {
            onFadeOut(faded) {
                this.faded = faded;
            },
        }
    };
</script>
<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
    }

    html {
        color: #EEE;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        min-height: 100%;
        margin: 0;
        padding: 0;
        background: #05121d;
        user-select: none;
    }

    a, label {
        outline: 0;
    }

    a:active, label:active {
        background: initial;
    }

    body {
        -webkit-tap-highlight-color: transparent;
        max-width: 1000px;
        margin: 0 auto;
        width: 95vw;
        border-bottom-right-radius: 16px;
        border-bottom-left-radius: 16px;
        background: linear-gradient(20deg, #051e34, #11283f);
        overflow-x: hidden;
    }

    @media (max-width: 600px) {
        body {
            border-radius: 0;
            width: 100vw;
            height: 100vh;
        }
    }

    main {
        padding: 4px;
        transition: opacity .3s;
    }

    /*noinspection ALL*/
    .faded {
        pointer-events: none;
        opacity: 0;
    }


    @keyframes FadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>
