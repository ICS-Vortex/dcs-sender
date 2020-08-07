<template>
    <div>
        <Loader :is-loading="loading"></Loader>
        <v-card>
            <v-card-title>Transferring UI <v-btn @click="connectToAMQP()" class="ml-2">Connect to queue</v-btn> </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col>
                        <v-progress-linear :active="sending" color="primary" indeterminate rounded height="8"/>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" sm="4" md="4">
                        <v-btn block :disabled="sending" left color="primary" @click="startSender">
                            Start sender
                            <v-icon right dark>mdi-play-speed</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col cols="12" sm="4" md="4">
                        <v-btn block :disabled="!sending" right dark color="red" @click="stopSender">
                            Stop sender
                            <v-icon right dark>mdi-stop-circle</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col cols="12" sm="4" md="4">
                        <v-btn class="primary" block @click="openLogs">
                            Open log file
                            <v-icon right dark>mdi-view-list-outline</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
                <v-simple-table height="420">
                    <thead>
                    <tr>
                        <th class="text-left">Time</th>
                        <th class="text-left">Message</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(message, i) in messages" :key="i"
                        :class="message.success === false ? 'red white--text' : ''">
                        <td>{{new Date | moment('YYYY-MM-DD hh:hh:ss')}}</td>
                        <td><b>{{message.text}}</b></td>
                    </tr>
                    <tr id="last-row">
                        <td colspan="2"/>
                    </tr>
                    </tbody>
                </v-simple-table>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
    import settings from 'electron-settings';
    import fs from 'fs';
    import iziToast from 'izitoast';
    import {shell} from 'electron';
    import log from 'electron-log';
    import Chokidar from 'chokidar';
    import amqp from 'amqp';
    import Loader from "../components/Loader";
    import {mapState, mapActions} from 'vuex';

    export default {
        name: 'home',
        components: {Loader},
        computed: {
            ...mapState(['amqp', 'serial']),
        },
        data() {
            return {
                loading: false,
                amqpConnection: null,
                amqpConnected: false,
                startBtnDisabled: false,
                stopBtnDisabled: true,
                servers: [],
                timer: null,
                interval: 15000,
                sending: false,
                messages: [],
            }
        },
        mounted() {
            this.reloadServers();
        },
        created() {
            this.loadCredentialsData();
        },
        beforeDestroy() {
            this.stopWatchers();
        },
        methods: {
            ...mapActions(['setAmqp']),
            loadCredentialsData() {
                this.$axios.get(this.$apiUrl + '/instances/get-credentials-data', {
                    headers: {
                        'X-DCS-SERIAL': this.serial
                    }
                }).then(response => {
                    const {status, data} = response.data;
                    if (status === 0) {
                        this.setAmqp(data.amqp);
                    } else {
                        iziToast.error({
                            title: 'Sender',
                            message: 'Failed to get important data',
                            position: 'topRight'
                        });
                    }
                }).catch((err) => {
                    log.error(err.toString());
                    iziToast.error({title: 'Sender', message: 'Failed to get important data', position: 'topRight'});
                });
            },
            connectToAMQP() {
                const vm = this;
                if (this.amqp === null) {
                    return;
                }
                vm.loading = true;
                this.appendToTable({text: 'Attempting to connect to VFP queue service...'}, true, true);

                const options = {
                    host: this.amqp.host,
                    port: this.amqp.port,
                    login: this.amqp.username,
                    password: this.amqp.password,
                    connectionTimeout: 3000,
                    authMechanism: 'AMQPLAIN',
                    vhost: '/',
                    noDelay: false,
                    ssl: {
                        enabled: false
                    }
                };

                const connectionOptions = {
                    reconnect: false,
                };
                vm.amqpConnection = amqp.createConnection(options, connectionOptions);

                vm.amqpConnection.on('error', (e) => {
                    vm.loading = false;
                    log.log("Error from amqp: ", e);
                    vm.stopSender();
                    vm.appendToTable({text: 'Failed to connect to VFP queue service'}, false, true);
                });

                vm.amqpConnection.on('ready', () => {
                    vm.loading = false;
                    iziToast.success({title: 'Sender', message: 'Connected to VFP queue service', position: 'topRight'});
                    vm.amqpConnected = true;
                    vm.startSender();
                });
            },
            reloadServers() {
                const vm = this;
                let serial = settings.get('application.serial');
                const headers = {
                    'X-DCS-SERIAL': serial
                };
                const url = this.$apiUrl + `/instances/get-servers`;
                this.$axios.get(url, {headers: headers})
                    .then(response => {
                        vm.servers = response.data;
                        if (vm.servers.length > 0) {
                            vm.connectToAMQP();
                        }
                    })
                    .catch(error => {
                        log.error(error.toString());
                    });
            },
            appendToTable(message, success = true, show = false) {
                message.success = success;
                this.messages.unshift(message);
                if (show) {
                    const data = {
                        title: 'Sender',
                        message: message.text,
                        position: 'topRight'
                    };
                    if (success) {
                        iziToast.info(data);
                    }else {
                        iziToast.error(data)
                    }
                }
            },
            openLogs() {
                shell.openPath(settings.get('application.logs_path'));
            },
            isJsonFile(file) {
                return file.includes('.json');
            },
            ignoreFile(file) {
                return file.includes('[0].json');
            },
            isNetworkAvailable() {
                return window.navigator.onLine;
            },
            startIsAllowed() {
                const serial = settings.get('application.serial', null);
                if (serial === null) {
                    const message = 'Serial number is missing';
                    log.error(message);
                    this.appendToTable({
                        text:message,
                        success: false,
                    }, false, true);
                    return false;
                }

                if (this.amqpConnected === false) {
                    const message = 'Sender is not connected to VFP queue service';
                    log.error(message);
                    this.appendToTable({
                        text:message,
                        success: false,
                    }, false, true);
                    this.connectToAMQP();
                    return false;
                }

                if (this.servers.length === 0) {
                    const message = 'Sender has no assigned servers. Please, contact administration';
                    log.error(message);
                    this.appendToTable({
                        text:message,
                        success: false,
                    }, false, true);
                    return false;
                }

                return true;
            },
            startSender() {
                if (!this.isNetworkAvailable) {
                    this.stopSender();
                    return false;
                }
                if (!this.startIsAllowed()) {
                    log.error('Failed to start sender');
                    return;
                }
                this.messages = [];
                this.sending = true;
                this.startBtnDisabled = true;
                this.stopBtnDisabled = false;
                this.startWatchers();
            },
            stopSender(notify = false, server = null) {
                this.sending = false;
                this.startBtnDisabled = false;
                this.stopBtnDisabled = true;
                this.stopWatchers();
                if (notify === true && server !== null) {
                    this.sendEmail(server, '[DCSSender] Sender stopped', 'Sender stopped. Please, check it.');
                }
            },
            getEventFromFile(file) {
                if (!fs.existsSync(file)) {
                    return null;
                }
                try {
                    let content = fs.readFileSync(file, {encoding: 'utf-8'});
                    let fileContent = content.toString();
                    return JSON.parse(fileContent);
                } catch (e) {
                    log.error(e.toString());
                    return null;
                }
            },
            sendEvent(server, event) {
                if (!event.event) {
                    this.appendToTable({
                        text: `Invalid JSON detected`,
                        success: false,
                    }, false, true);
                    return;
                }
                event.server = {identifier: server.identifier};
                const content = JSON.stringify(event);
                this.amqpConnection.publish('json_messages', content)
            },
            sendSrsData(server) {
                let srsFile = server.srsFile;
                if (srsFile === null) {
                    return false;
                }
                srsFile = srsFile.toString();
                try {
                    let content = JSON.parse(fs.readFileSync(srsFile, {encoding: 'utf-8'}));
                    content.event = 'srs';
                    content.time = new Date().toISOString().slice(0, 19).replace('T', ' ');
                    content.server = {
                        identifier: server.identifier,
                    };
                    this.amqpConnection.publish('json_messages', content)
                    this.messages.unshift({text: 'SRS event done'});
                } catch (e) {
                    log.error(e.toString());
                }
            },
            startWatchers() {
                for (let i = 0; i < this.servers.length; i++) {
                    if (this.servers[i].active === false) {
                        this.messages.unshift({
                            text: `Server ${this.servers[i].name} is disabled`,
                        });
                        continue;
                    }
                    const srsFile = this.servers[i].srsFile;
                    const folder = this.servers[i].reportsLocation;
                    if (folder === null) {
                        this.messages.unshift({
                            text: `Server ${this.servers[i].name} have no folder`,
                            success: false,
                        });
                        continue;
                    }
                    if (fs.existsSync(folder)) {
                        this.servers[i].jsonWatcher = Chokidar.watch(folder, {
                            interval: 15 * 1000,
                            persistent: true,
                        });
                        this.servers[i].jsonWatcher
                            .on('add', (path) => {
                                if (this.isJsonFile(path)) {
                                    if (!this.ignoreFile(path)) {
                                        let event = this.getEventFromFile(path);
                                        if (event !== null) {
                                            this.sendEvent(this.servers[i], event);
                                            this.deleteFile(path);
                                        } else {
                                            log.error(`Failed to read file ${path}`);
                                            this.appendToTable({
                                                text: `Failed to read file ${path}`,
                                                success: false,
                                            });
                                            this.deleteFile(path);
                                        }
                                    } else {
                                        this.deleteFile(path);
                                    }
                                }
                                if (fs.existsSync(srsFile)) {
                                    this.sendSrsData(this.servers[i]);
                                }
                            });
                    } else {
                        this.appendToTable({
                            text: `Folder ${folder} does not exists!`,
                            success: false,
                        }, false, true);
                        log.error(`Folder ${folder} does not exists!`);
                        this.stopSender();
                        return;
                    }


                }
            },
            stopWatchers() {
                for (let i = 0; i < this.servers.length; i++) {
                    if (this.servers[i].active === false) {
                        continue;
                    }
                    if (this.servers[i].jsonWatcher !== null && this.servers[i].jsonWatcher !== undefined) {
                        this.servers[i].jsonWatcher.unwatch(this.servers[i].reportsLocation);
                        this.servers[i].jsonWatcher = null;
                    }
                    if (this.servers[i].srsWatcher !== null && this.servers[i].srsWatcher !== undefined) {
                        this.servers[i].srsWatcher.unwatch(this.servers[i].srsFile);
                        this.servers[i].srsWatcher = null;
                    }
                }
            },
            deleteFile(file) {
                try {
                    fs.unlinkSync(file);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            sendEmail(server, subject, message) {
                const url = this.$apiUrl + '/open/emails/send';
                let recipients = [server.email];
                let data = {
                    subject: subject,
                    body: message,
                    recipients: recipients
                };
                this.axios.post(url, JSON.stringify(data)).then(() => {
                    iziToast.info({
                        title: 'System',
                        message: 'Notification email sent',
                        position: 'topRight'
                    });
                }).catch((err) => {
                    log.error(err.toString());
                });
            },
        },
    }
</script>

<style lang="scss" scoped>
    .v-simple-table {

    }

    .md-scrollbar {
        max-height: 450px;
        overflow: auto;
    }
</style>
