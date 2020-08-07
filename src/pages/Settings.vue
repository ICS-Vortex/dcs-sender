<template>
    <v-container fluid>
        <div class="text-center">
            <v-dialog transition="scroll-y-transition" v-model="dialog" width="800">
                <v-card>
                    <v-card-title class="app-font">
                        Update server information
                    </v-card-title>
                    <v-spacer></v-spacer>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12" sm="3" md="3">
                                    <v-switch dark v-model="server.active" class="ma-2" label="Data transfer"/>
                                </v-col>
                                <v-col cols="12" sm="3" md="3">
                                    <v-switch dark v-model="server.showMap" class="ma-2" label="Map"/>
                                </v-col>
                                <v-col cols="12" sm="3" md="3">
                                    <v-switch dark v-model="server.sendDiscordNotifications" class="ma-2"
                                              label="Discord notifications"/>
                                </v-col>
                                <v-col cols="12" sm="3" md="3">
                                    <v-switch dark v-model="server.sendDiscordServerNotifications" class="ma-2"
                                              label="Server notifications"/>
                                </v-col>
                                <v-col cols="12" sm="4" md="4">
                                    <v-switch dark v-model="server.sendDiscordFlightNotifications" class="ma-2"
                                              label="Flight notifications"/>
                                </v-col>
                                <v-col cols="12" sm="4" md="4">
                                    <v-switch dark v-model="server.sendDiscordCombatNotifications" class="ma-2"
                                              label="Combat notifications"/>
                                </v-col>
                                <v-col cols="12" sm="4" md="4">
                                    <v-switch dark v-model="server.sendDiscordFriendlyFireNotifications" class="ma-2"
                                              label="Friendly fire notifications"/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field v-model="server.name" label="Server name" required/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field v-model="server.email" label="Admin email" required/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field v-model="server.discordBotToken" label="Discord Bot Token"/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field v-model="server.discordServerId"
                                                  label="Discord server ID (for Widget)"/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field v-model="server.discordWebHook" label="Discord webhook URL"/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field v-model="server.address" label="Server address" required/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field v-model="server.port" label="Server port" required/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field v-model="server.reportsLocation" label="Reports location" required/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field v-model="server.teamSpeakAddress" label="TS address"/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field v-model="server.srsAddress" label="SRS address"/>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field v-model="server.srsFile" label="SRS file"/>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>

                    <v-divider/>

                    <v-card-actions>
                        <v-btn @click="findSrsFile">Set SRS file</v-btn>
                        <v-btn @click="findReportsFolder">Set reports folder</v-btn>
                        <v-spacer/>
                        <v-btn dark color="secondary" @click="saveInstance">Save</v-btn>
                        <v-btn color="error" @click="closeDialog">Close</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>
        <v-row>
            <v-col cols="12">
                <h2 class="display-1 app-font">
                    Servers list
                    <v-btn>
                        <v-icon color="light-blue" @click="reloadServers()">mdi-refresh</v-icon>
                    </v-btn>
                </h2>
            </v-col>
        </v-row>
        <v-row>
            <v-col v-for="(server, i) in servers" :key="i" cols="12" sm="6" md="4">
                <v-hover v-slot:default="{ hover }">
                    <v-card @click="editServer(server)" :elevation="hover ? 6 : 2" class="server-card">
                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title class="headline">{{server.name}}</v-list-item-title>
                                <v-list-item-subtitle>{{server.address}} : {{server.port}}</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                        <v-card-actions>
                            <v-chip v-if="server.active === true" class="ma-2" color="cyan" text-color="white">Active
                            </v-chip>
                            <v-chip v-else class="ma-2" color="grey" text-color="white">Disabled</v-chip>
                            <v-spacer/>
                            <!--                            <v-btn icon @click="editServer(server)"><v-icon>mdi-pencil</v-icon></v-btn>-->
                        </v-card-actions>
                    </v-card>
                </v-hover>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import iziToast from 'izitoast';
    import {remote} from 'electron';
    import log from 'electron-log';
    import {mapState, mapActions} from 'vuex';

    export default {
        name: 'Settings',
        computed: {...mapState(['serial'])},
        data() {
            return {
                server: {
                    id: null,
                    sendDiscordNotifications: false,
                    sendDiscordServerNotifications: false,
                    sendDiscordFlightNotifications: false,
                    sendDiscordCombatNotifications: false,
                    sendDiscordFriendlyFireNotifications: false,
                    discordWebHook: null,
                    discordBotToken: null,
                    discordServerId: null,
                    identifier: null,
                    showMap: true,
                    active: true,
                    name: null,
                    address: null,
                    port: null,
                    email: null,
                    srsAddress: null,
                    srsFile: null,
                    teamSpeakAddress: null,
                    reportsLocation: null,
                },
                servers: [],
                dialog: false,
                edit: false,
                userSaved: false,
                sending: false,
                lastUser: null
            }
        },
        created() {
            this.reloadServers();
        },
        beforeDestroy() {
            clearTimeout(this.timer);
        },
        methods: {
            ...mapActions(["startLoading", "stopLoading"]),
            reloadServers() {
                const vm = this;
                this.servers = [];
                this.startLoading();
                const url = this.$apiUrl + `/instances/get-servers`;
                const headers = {
                    'X-DCS-SERIAL': this.serial,
                };
                this.$axios.get(url, {headers: headers}).then(response => {
                    vm.servers = response.data;
                })
                    .catch(error => {
                        log.error(error.toString());
                    })
                    .finally(() => {
                        this.stopLoading();
                    });
            },
            editServer(server) {
                this.server.id = server.id;
                this.server.sendDiscordNotifications = server.sendDiscordNotifications;
                this.server.sendDiscordServerNotifications = server.sendDiscordServerNotifications;
                this.server.sendDiscordFlightNotifications = server.sendDiscordFlightNotifications;
                this.server.sendDiscordCombatNotifications = server.sendDiscordCombatNotifications;
                this.server.sendDiscordFriendlyFireNotifications = server.sendDiscordFriendlyFireNotifications;
                this.server.identifier = server.identifier;
                this.server.name = server.name;
                this.server.discordWebHook = server.discordWebHook;
                this.server.email = server.email;
                this.server.showMap = server.showMap;
                this.server.active = server.active;
                this.server.address = server.address;
                this.server.port = server.port;
                this.server.srsAddress = server.srsAddress;
                this.server.teamSpeakAddress = server.teamSpeakAddress;
                this.server.srsFile = server.srsFile;
                this.server.reportsLocation = server.reportsLocation;

                this.dialog = true;
            },
            saveInstance() {
                this.startLoading();
                const data = JSON.stringify({
                    email: this.server.email,
                    discordWebHook: this.server.discordWebHook,
                    showMap: this.server.showMap,
                    active: this.server.active,
                    sendDiscordNotifications: this.server.sendDiscordNotifications,
                    sendDiscordServerNotifications: this.server.sendDiscordServerNotifications,
                    sendDiscordFlightNotifications: this.server.sendDiscordFlightNotifications,
                    sendDiscordCombatNotifications: this.server.sendDiscordCombatNotifications,
                    sendDiscordFriendlyFireNotifications: this.server.sendDiscordFriendlyFireNotifications,
                    name: this.server.name,
                    address: this.server.address,
                    port: this.server.port,
                    teamSpeakAddress: this.server.teamSpeakAddress,
                    srsAddress: this.server.srsAddress,
                    srsFile: this.server.srsFile,
                    reportsLocation: this.server.reportsLocation,
                });
                const vm = this;
                const url = this.$apiUrl + `/instances/update-server/${this.server.id}`;
                const headers = {
                    'X-DCS-SERIAL': this.serial
                };
                this.$axios.put(url, data, {headers: headers}).then(response => {
                    const {status, message} = response.data;
                    if (status === 0) {
                        vm.closeDialog();
                        vm.reloadServers();
                        iziToast.info({title: 'Sender', message: message, position: 'topRight'});
                    } else if (status === 999) {
                        if (response.data.errors !== undefined && response.data.errors.length > 0) {
                            for (let i = 0; i < response.data.errors.length; i++) {
                                iziToast.warning({
                                    title: 'Sender',
                                    message: response.data.errors[i],
                                    position: 'topRight'
                                });
                            }
                        }
                        iziToast.error({title: 'Sender', message: message, position: 'topRight'});
                    } else {
                        iziToast.warning({title: 'Sender', message: message, position: 'topRight'});
                    }
                })
                    .catch(err => {
                        iziToast.error({
                            title: 'Sender',
                            message: err.toString(),
                            position: 'topRight'
                        });
                        log.info(err.toString());
                    })
                    .finally(() => {
                        this.stopLoading();
                    });
                this.closeDialog();
            },
            closeDialog() {
                this.server.id = null;
                this.server.sendDiscordNotifications = false;
                this.server.sendDiscordServerNotifications = false;
                this.server.sendDiscordFlightNotifications = false;
                this.server.sendDiscordCombatNotifications = false;
                this.server.sendDiscordFriendlyFireNotifications = false;
                this.server.identifier = null;
                this.server.showMap = false;
                this.server.active = false;
                this.server.title = null;
                this.server.discordWebHook = null;
                this.server.address = null;
                this.server.port = null;
                this.server.srsFile = null;
                this.server.srsAddress = null;
                this.server.teamSpeakAddress = null;
                this.server.email = null;
                this.server.reportsLocation = null;

                this.dialog = false;

            },
            findSrsFile() {
                const WIN = remote.getCurrentWindow();
                const vm = this;
                let options = {
                    title: "Select SRS file",
                    defaultPath: remote.app.getPath('documents'),
                    buttonLabel: "Select",
                    filters: [
                        {name: 'JSON files', extensions: ['json']},
                        {name: 'All Files', extensions: ['*']}
                    ],
                    properties: ['openFile']
                };

                remote.dialog.showOpenDialog(WIN, options).then(data => {
                    if (!data.canceled) {
                        vm.server.srsFile = data.filePaths[0];
                    }
                });
            },
            findReportsFolder() {
                const WIN = remote.getCurrentWindow();
                const vm = this;
                let options = {
                    title: "Select DCS World reports folder",
                    defaultPath: remote.app.getPath('documents'),
                    buttonLabel: "Select",
                    filters: [
                        {name: 'All Files', extensions: ['*']}
                    ],
                    properties: ['openDirectory']
                };

                remote.dialog.showOpenDialog(WIN, options).then(data => {
                    if (!data.canceled) {
                        vm.server.reportsLocation = data.filePaths[0];
                    }
                });
            },
        }
    }
</script>
<style type="scss">
    card.server-card:hover {
        cursor: grabbing !important;
    }
</style>
