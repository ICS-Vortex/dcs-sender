<template>
    <v-app v-if="appIsAuthorized">
        <v-app-bar app dark>
            <div class="d-flex align-center">
                <v-img alt="Sender Logo" class="shrink mr-2" contain src="@/assets/logo.png"
                       transition="scale-transition" width="40"/>
                <div class="shrink mt-1 app-title app-font">DCS Sender</div>
            </div>

            <v-spacer/>
            <v-toolbar-items>
                <v-btn @click="openWebsite('https://vfpteam.com')" class="hidden-sm-and-down" text>
                    <span class="mr-1">VFP Team website</span>
                    <v-icon>mdi-open-in-new</v-icon>
                </v-btn>
                <v-divider vertical/>
                <v-btn class="menu-btn" to="/" text>
                    <v-icon class="mr-1">mdi-home</v-icon> Home
                </v-btn>
                <v-divider vertical/>
                <v-btn class="menu-btn" to="/settings" text>
                    <v-icon class="mr-1">mdi-cog-outline</v-icon> Settings
                </v-btn>
                <v-btn class="menu-btn" to="/faq" text>
                    <v-icon class="mr-1">mdi-help-circle</v-icon> FAQ
                </v-btn>
                <v-btn class="menu-btn" @click="checkForUpdates(true)" text>
                    <v-icon class="mr-1">mdi-download</v-icon>Updates
                </v-btn>
            </v-toolbar-items>
        </v-app-bar>
        <v-dialog v-model="updateDialog" max-width="290">
            <v-card>
                <v-card-title class="headline app-font">New version available!</v-card-title>

                <v-card-text>
                    <h3 v-if="patchNotes" class="font-weight-bold">What's new: </h3>
                    <p v-if="patchNotes" v-html="patchNotes" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>

                    <v-btn color="error" text @click="updateDialog = false">
                        Cancel
                    </v-btn>

                    <v-btn @click="downloadUpdates" color="primary" text>
                        Download
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="noUpdatesDialog" max-width="290">
            <v-card>
                <v-card-title class="headline">DCS sender</v-card-title>
                <v-card-text>Your instance is up to dated!</v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn color="accent" text @click="noUpdatesDialog = false">
                        Ok
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-main>
            <router-view/>
        </v-main>
        <v-footer dark absolute class="app-font">
            <v-col class="text-center" cols="12">
                VFP Team &copy; {{ new Date().getFullYear() }} — <strong>DCS Stats sender (v.{{currentVersion}})</strong>
            </v-col>
        </v-footer>
    </v-app>
    <v-app v-else id="inspire">
        <v-main>
            <v-container class="fill-height" fluid>
                <v-row align="center" justify="center">
                    <v-col cols="12" sm="12" md="6">
                        <v-card class="elevation-10">
                            <v-toolbar color="primary" dark flat>
                                <v-toolbar-title class="app-font">DCS Sender (v.{{currentVersion}})</v-toolbar-title>
                            </v-toolbar>
                            <v-card-text>
                                <v-form v-model="valid" lazy-validation>
                                    <v-icon color="primary">mdi-shield-lock</v-icon>
                                    <v-text-field v-model="serialNumber" label="Serial number"/>
                                </v-form>
                                <Loader :is-loading="isLoading" />
                                <v-alert v-show="verificationFailed" color="error" border="left"
                                         elevation="2" colored-border icon="mdi-alert">
                                    {{validationMessage}}
                                </v-alert>

                            </v-card-text>
                            <v-card-actions class="text-center">
                                <v-btn color="primary" @click="validateSerialNumber">Activate</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>

</template>

<script>
    import settings from 'electron-settings';
    import log from 'electron-log';
    import {remote, shell} from 'electron';
    import Loader from "./components/Loader";

    export default {
        name: 'App',
        components: {Loader},
        props: {
            source: String,
        },
        data() {
            return {
                valid: true,
                currentVersion: null,
                newVersion: null,
                patchNotes: null,
                updatesInterval: null,
                updateDialog: false,
                noUpdatesDialog: false,
                validationMessage: null,
                serialNumber: null,
                appIsAuthorized: false,
                isLoading: false,
                verificationFailed: false,
            }
        },
        created() {
            this.currentVersion = remote.app.getVersion();
            let serial = settings.get('application.serial', null);
            if (serial === null) {
                this.appIsAuthorized = false;
                return;
            }
            let url = this.$apiUrl + '/instances/validate';
            this.$axios.post(url, null, {headers: {'X-DCS-SERIAL': serial}}).then(response => {
                let {status, message} = response.data;
                log.info(message);
                if (status === 0) {
                    this.appIsAuthorized = true;
                } else {
                    this.appIsAuthorized = false;
                    this.verificationFailed = true;
                    this.validationMessage = message;
                }
            }).catch((e) => {
                this.appIsAuthorized = false;
                this.verificationFailed = true;
                this.validationMessage = e.toString();
            });
        },
        mounted() {
            let logsPath;
            switch (process.platform) {
                case "win32":
                    logsPath = remote.app.getPath('appData') + '\\' + remote.app.getName() + '\\' + 'log.log';
                    break;
                case "linux":
                    logsPath = '~/.config/' + remote.app.getName() + '/log.log';
                    break;
                case "darwin":
                    break;
                default:
            }
            settings.set('application.logs_path', logsPath);
            const startup = settings.get('application.startup', 0);
            settings.set('application.startup', startup + 1);
            this.handleUpdates();
        },
        methods: {
            openWebsite(link) {
                shell.openExternal(link);
            },
            handleUpdates() {
                const vm = this;
                if (this.appIsAuthorized === true) {
                    this.updatesInterval = setInterval(() => {
                        vm.checkForUpdates();
                    }, 10 * 60 * 1000);
                }
            },
            checkForUpdates(notifyNoVersion = false) {
                log.info('Checking for updates...');
                this.isLoading = true;
                const vm = this;
                const headers = {
                    'X-DCS-SERIAL' : settings.get('application.serial')
                };
                this.$axios.get(this.$apiUrl + '/sender/check-updates', {headers: headers})
                    .then(response => {
                        vm.isLoading = false;
                        const {status, version, notes} = response.data;
                        if (status === 0) {
                            let current = parseInt(remote.app.getVersion().split('.').join(''));
                            if (version > current) {
                                vm.newVersion = version;
                                log.info('New version available');
                                vm.patchNotes = notes;
                                vm.updateDialog = true;
                                clearInterval(vm.updatesInterval);
                            } else {
                                if (notifyNoVersion) {
                                    vm.noUpdatesDialog = true;
                                }
                                log.info('No new versions found');
                            }
                        } else {
                            if (notifyNoVersion === true) {
                                vm.noUpdatesDialog = true;
                            }
                        }
                    })
                    .catch(err => {
                        vm.isLoading = false;
                        log.error(err.toString());
                });
            },
            downloadUpdates() {
                const vm = this;
                this.$axios({
                    method: 'get',
                    headers: {
                        'X-DCS-SERIAL' : settings.get('application.serial')
                    },
                    url: this.$apiUrl + '/sender/download/' + this.newVersion,
                })
                .then(response => {
                    log.info(response);
                    vm.forceFileDownload(response);
                })
                .catch((err) => log.error(err.toString()));
            },
            forceFileDownload(response) {
                const {link, file} = response.data;
                const anchor = document.createElement('a');
                anchor.href = link;
                anchor.target = '_blank';
                anchor.setAttribute('download', file.exe); //or any other extension
                document.body.appendChild(anchor);
                anchor.click();
                this.updateDialog = false;
            },
            validateSerialNumber() {
                this.verificationFailed = false;
                this.isLoading = true;
                const vm = this;
                if (this.serialNumber === null) {
                    vm.isLoading = false;
                    vm.validationMessage = 'Please, insert a valid serial number';
                    vm.verificationFailed = true;
                    return;
                }
                const headers = {
                    'X-DCS-SERIAL' : this.serialNumber.trim(),
                };
                let url = this.$apiUrl + '/instances/validate';
                this.$axios.get(url, {headers: headers})
                    .then(response => {
                        vm.isLoading = false;
                        const {status, message} = response.data;
                        if (status === 0) {
                            vm.appIsAuthorized = true;
                            vm.verificationFailed = false;
                            settings.set('application.serial', vm.serialNumber);
                        } else {
                            vm.validationMessage = message;
                            vm.verificationFailed = true;
                        }
                    })
                    .catch(error => {
                        vm.isLoading = false;
                        vm.validationMessage = error.toString();
                        vm.verificationFailed = true;
                    });
            },
        },
    };
</script>
