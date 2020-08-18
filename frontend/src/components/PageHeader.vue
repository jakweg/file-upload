<template>
    <header>
        <router-link to="/">{{title}}</router-link>
    </header>
</template>

<script>
    export default {
        name: 'PageHeader',
        data() {
            return {
                title: null,
                defaultValue: 'File uploader'
            };
        },
        methods: {
            changedRoute(to) {
                this.title = (to.meta ? to.meta.title : null) || this.defaultValue;
            }
        },
        created() {
            this.onregister = this.$router.afterEach(this.changedRoute);
            this.changedRoute(this.$route);
        },
        destroyed() {
            this.onregister();
        }
    };
</script>

<style scoped>
    header {
        display: block;
        border-bottom: 1px solid #555;
        background: #389a70;
        box-shadow: 0 0 6px #000;
    }

    @media (min-width: 600px) {
        header {
            border-radius: 0 0 8px 8px;
        }
    }

    a {
        color: inherit;
        text-decoration: none;
        display: block;
        padding: 8px;
        font-size: 2em;
        font-weight: bolder;
    }

    a:active {
        background: unset;
    }
</style>
