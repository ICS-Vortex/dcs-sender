<template>
    <v-app>
        <v-main>
            <v-container class="fill-height" fluid>
                <v-row align="center" justify="center">
                    <v-col cols="12" sm="12" md="6">
                        <v-card class="elevation-10">
                            <v-toolbar color="primary" dark flat>
                                <v-toolbar-title class="app-font">DCS Sender ( v.{{version}} )</v-toolbar-title>
                            </v-toolbar>
                            <v-card-text>
                                <v-form v-model="valid" lazy-validation>
                                    <v-icon color="primary">mdi-shield-lock</v-icon>
                                    <v-text-field v-model="serialNumber" label="Serial number"/>
                                </v-form>
                                <alert :show="alert.show" :type="alert.type" :message="alert.message"/>

                            </v-card-text>
                            <v-card-actions class="text-center">
                                <v-btn color="primary" @click="activateApplication">Activate</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
    import {remote} from 'electron';
    import settings from 'electron-settings';
    import log from 'electron-log';
    import {mapState, mapMutations, mapActions} from 'vuex';
    import Alert from "./Alert";

    export default {
        name: "ActivationComponent",
        components: {Alert},
        computed: {
            ...mapState([
                'authenticated',
                'serial',
                'version'
            ]),
        },
        data() {
            return {
                alert: {
                    show: false,
                    message: null,
                    type: null,
                },
                valid: true,
                serialNumber: null,
            }
        },
        created() {
            this.serialNumber = this.serial;
        },
        mounted() {
            this.currentVersion = remote.app.getVersion();
        },
        methods: {
            ...mapMutations(['SET_AUTHENTICATED']),
            ...mapActions(['setAuthenticated', 'startLoading', 'stopLoading']),
            showAlert(type, message) {
                this.alert.show = true;
                this.alert.type = type;
                this.alert.message = message;
            },
            activateApplication() {
                this.startLoading();
                this.verificationFailed = false;
                const vm = this;
                if (this.serialNumber === null) {
                    this.stopLoading();
                    this.showAlert('error', 'Please, provide a valid serial number');
                    return;
                }
                const headers = {
                    'X-DCS-SERIAL': this.serialNumber.trim(),
                };
                let url = this.$apiUrl + '/instances/validate';
                this.$axios.get(url, {headers: headers}).then(response => {
                    const {status, message} = response.data;
                    if (status === 0) {
                        this.setAuthenticated(true);
                        settings.set('application.serial', vm.serialNumber);
                        this.$router.push('/');
                    } else {
                        this.showAlert('error', message);
                    }
                })
                    .catch(error => {
                        log.error(error);
                        switch (error.response.status) {
                            case 403:
                                this.showAlert('error', 'Access denied! Your serial number is invalid');
                                break;
                            default:
                                this.showAlert('error', error.toString());
                        }
                    })
                    .finally(() => {
                        this.stopLoading();
                    });
            },
        },
    }
</script>

<style scoped>

</style>