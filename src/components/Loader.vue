<template>
    <div class="text-center">
        <v-overlay :value="isLoading">
            <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
        </v-overlay>
    </div>
</template>

<script>
    export default {
        name: "Loader",
        props: {
            isLoading: Boolean
        }
    }
</script>

<style scoped>

</style>
