<template>
    <v-app>
        <v-app-bar app dark>
            <div class="d-flex align-center">
                <v-img alt="DCS Sender" class="shrink mr-2" contain src="@/assets/logo.png"
                       transition="scale-transition" width="40"/>
                <div class="shrink mt-1 app-title app-font">DCS Sender</div>
            </div>
            <v-spacer/>
            <v-toolbar-items>
                <v-btn @click="openWebsite('https://vfpteam.com')" class="hidden-sm-and-down" text>
                    <span class="mr-1">VFP Team website</span>
                    <v-icon>mdi-earth-arrow-right</v-icon>
                </v-btn>
                <v-divider vertical/>
                <v-btn class="menu-btn" to="/" text>
                    <v-icon class="mr-1">mdi-home</v-icon>
                    Home
                </v-btn>
                <v-btn class="menu-btn" to="/faq" text>
                    <v-icon class="mr-1">mdi-help-circle</v-icon>
                    FAQ
                </v-btn>
                <v-divider vertical/>
                <v-btn class="menu-btn" to="/settings" text>
                    <v-icon class="mr-1">mdi-cog-outline</v-icon>
                    Settings
                </v-btn>
            </v-toolbar-items>
        </v-app-bar>
        <v-main>
            <router-view/>
        </v-main>
        <v-footer dark absolute class="app-font">
            <v-col class="text-center" cols="12">
                VFP Team &copy; {{ new Date().getFullYear() }} — <strong>DCS Stats sender (v.{{version}})</strong>
            </v-col>
        </v-footer>
    </v-app>
</template>

<script>
    import {shell} from "electron";
    import {mapState} from 'vuex';

    export default {
        name: "ApplicationComponent",
        computed: {
            ...mapState([
                'version',
            ]),
        },
        methods: {
            openWebsite(link) {
                shell.openExternal(link);
            },
        },
    }
</script>

<style scoped>

</style>