<template>
    <v-row class="mt-4">
        <v-expansion-panels inset :accordion="false" :popout="false" :multiple="false"
                            :focusable="false" :disabled="false" :readonly="false" :flat="false"
                            :hover="true" :tile="false">
            <v-expansion-panel v-for="(question, i) in questions" :key="i">
                <v-expansion-panel-header class="text-left">
                    <template v-slot:actions>
                        <v-icon color="primary">mdi-arrow-down-bold-circle</v-icon>
                    </template>
                    <div>
                        <v-icon size="30" color="primary">mdi-help-circle</v-icon>
                        <span class="text">
                        <b>{{question.questionEn}}</b>
                    </span>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <p v-html="question.answerEn" />
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </v-row>
</template>

<script>
    import {mapState, mapActions} from 'vuex';

    export default {
        name: "Faq",
        computed: {
            ...mapState(['serial']),
        },
        data() {
            return {
                questions: [],
            };
        },
        mounted() {
            this.startLoading();
            const url = `${this.$apiUrl}/faq/list`;
            const headers = {
                'X-DCS-SERIAL': this.serial,
            };
            this.$axios.get(url, {headers: headers}).then(response => {
                this.questions = response.data.questions;
            }).finally(() => {
                this.stopLoading();
            });
        },
        methods: {
            ...mapActions(["startLoading", "stopLoading"]),
        },
    }
</script>

<style lang="scss" scoped>
    .v-expansion-panels{
        margin-bottom: 60px;
    }
</style>
