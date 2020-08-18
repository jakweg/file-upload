<template>
    <router-link
            :class="{disabled, red}"
            :to="to"
            @click="!disabled && $emit('click', $event)"
            v-if="to && !externalSite">
        <LazyImage :file="`/assets/${icon}.svg`" size="24px" v-if="icon"/>
        {{title}}
    </router-link>

    <a :class="{disabled, red}"
       :href="to"
       @click="!disabled && $emit('click', $event)"
       target="_blank"
       v-else>
        <LazyImage :file="`/assets/${icon}.svg`" size="24px" v-if="icon"/>
        <span v-if="title">{{title}}</span>
    </a>

</template>

<script>
    import LazyImage from './LazyImage';

    export default {
        name: 'NiceButton',
        components: {LazyImage},
        props: {
            title: {
                type: String,
                required: true
            },
            icon: String,
            to: String,
            disabled: Boolean,
            externalSite: Boolean,
            red: Boolean
        },
    };
</script>

<!--suppress CssUnusedSymbol -->
<style scoped>
    a {
        box-sizing: border-box;
        background: #5b5bc3;
        display: inline-flex;
        padding: 8px 12px;
        border-radius: 8px;
        margin: 8px;
        font-weight: bold;
        color: #fff;
        cursor: pointer;
        transition: background-color .3s, color .3s, opacity .3s;
        text-decoration: none;
        align-items: center;
        justify-content: center;
    }

    a > :first-child {
        padding-right: 6px;
    }

    a > :last-child {
        padding-right: 2px;
    }

    a:hover {
        background: #4b4ba5;
    }

    .disabled {
        cursor: default;
        background: #373787;
        color: #aaa;
        pointer-events: none;
    }

    .disabled > :first-child {
        opacity: .4;
    }

    .red {
        background-color: #DD0000;
    }

    .red:hover {
        background-color: #BB0000;
    }

    .red.disabled {
        background-color: #770000;
    }
</style>
