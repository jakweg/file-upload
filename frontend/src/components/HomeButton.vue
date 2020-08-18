<template>
    <router-link
            :to="to"
            @click.native="$emit('click', $event)">
        <LazyImage :file="`/assets/${icon}.svg`" class="icon" size="48px" v-if="icon"/>
        <span>{{title}}</span>
    </router-link>

</template>

<script>
    import LazyImage from './LazyImage';

    export default {
        name: 'HomeButton',
        components: {LazyImage},
        props: {
            icon: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            to: {
                type: String,
                required: true,
            },
        }
    };
</script>

<style scoped>
    a {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;
        color: white;
        text-decoration: none;
        font-weight: bold;
        font-size: 1.7em;
        padding: 2px;
        background: #373787;
        border-radius: 6px;
        margin: 16px 4px;
        box-shadow: 2px 1px 6px #00000077;
        transition: background-color .3s;
    }

    a:hover {
        background: #4b4ba5;
    }

    span {
        flex: 1;
    }

    .icon {
        padding: 8px;
    }

    @media (min-height: 600px) {
        a {
            flex-direction: column;
            padding: 16px;
        }

    }

</style>
