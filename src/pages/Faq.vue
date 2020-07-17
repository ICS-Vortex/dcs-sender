<template>
    <v-row class="mt-4">
        <Loader :is-loading="loading" />
        <v-expansion-panels inset
                :accordion="accordion"
                :popout="popout"
                :multiple="multiple"
                :focusable="focusable"
                :disabled="disabled"
                :readonly="readonly"
                :flat="flat"
                :hover="hover"
                :tile="tile"
        >
            <v-expansion-panel v-for="(question, i) in questions" :key="i">
                <v-expansion-panel-header  class="text-left">
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
    import settings from 'electron-settings';
    import Loader from "../components/Loader";

    export default {
        name: "Faq",
        components: {Loader},
        data() {
            return {
                loading: false,
                accordion: false,
                popout: false,
                inset: false,
                multiple: false,
                disabled: false,
                readonly: false,
                focusable: false,
                flat: false,
                hover: true,
                tile: false,
                questions: [],
            };
        },
        mounted() {
            this.loading = true;
            const url = `${this.$apiUrl}/faq/list`;
            const headers = {
                'X-DCS-SERIAL': settings.get('application.serial'),
            };
            this.$axios.get(url, {headers : headers}).then(response => {
                this.questions = response.data.questions;
            }).finally(() => {
                this.loading = false;
            });
        }
    }
</script>

<style lang="scss" scoped>
    .v-expansion-panels{
        margin-bottom: 60px;
    }
</style>
