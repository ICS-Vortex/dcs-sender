<template>
    <v-alert v-show="show" :color="type" border="left"
             elevation="2" colored-border icon="mdi-alert">
        {{message}}
    </v-alert>
</template>

<script>
    export default {
        props: {
            type: String,
            message: String,
            show: Boolean
        },
        name: "Alert"
    }
</script>