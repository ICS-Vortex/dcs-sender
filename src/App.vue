<template>
    <div>
        <Loader :is-loading="loading"/>
        <ApplicationComponent v-if="authenticated"/>
        <ActivationComponent v-else/>
    </div>
</template>

<script>
    import settings from 'electron-settings';
    import log from 'electron-log';
    import {remote} from 'electron';
    import Loader from "./components/Loader";
    import ActivationComponent from "./components/ActivationComponent";
    import {mapState, mapMutations, mapActions} from 'vuex';
    import ApplicationComponent from "./components/ApplicationComponent";

    export default {
        name: 'App',
        computed: {
            ...mapState([
                'loading',
                'authenticated',
                'serial'
            ]),
        },
        components: {ApplicationComponent, ActivationComponent, Loader},
        data() {
            return {
                valid: true,
                currentVersion: null,
                verificationFailed: false,
            }
        },
        mounted() {
            this.validateSerial();
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
            settings.set(
                'application.startup',
                settings.get('application.startup', 0) + 1
            );
        },
        methods: {
            ...mapMutations(['SET_AUTHENTICATED']),
            ...mapActions(['setAuthenticated', 'startLoading', 'stopLoading']),
            validateSerial() {
                this.startLoading();
                if (this.serial === null) {
                    this.stopLoading();
                    this.setAuthenticated(false);
                    return;
                }
                const rConfig = {headers: {'X-DCS-SERIAL': this.serial}};
                this.$axios.post(this.$apiUrl + '/instances/validate', null, rConfig).then(response => {
                    let {status} = response.data;
                    if (status === 0) {
                        this.setAuthenticated(true);
                        this.$router.push('/');
                    }
                }).catch((e) => {
                    log.error(e);
                    switch (e.response.status) {
                        case 403:

                            break;
                    }
                    this.serialNumber = this.serial;
                    this.setAuthenticated(false);
                }).finally(() => {
                    this.stopLoading();
                });
            },
        },
    };
</script>
