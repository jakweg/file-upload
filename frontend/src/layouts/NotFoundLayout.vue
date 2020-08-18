<template>
    <div>
        <h2>Unfortunately this site does not exist</h2>
        <NiceButton title="Go home" to="/"/>
    </div>
</template>

<script>
    import NiceButton from '../components/NiceButton';

    export default {
        name: 'NotFoundLayout',
        components: {NiceButton}
    };
</script>

<style scoped>

</style>
