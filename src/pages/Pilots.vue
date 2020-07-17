<template>
    <div class="pilots">
        <h2>Registered pilots</h2>
        <md-toolbar v-if="pilots.length === 0" class="md-accent">
            <h3 class="md-title">Pilots not found</h3>
        </md-toolbar>
        <md-table v-model="searched" md-sort="callsign" md-fixed-header md-card>
            <md-table-toolbar>
                <div class="md-toolbar-section-start">
                    <h1 class="md-title">Pilots</h1>
                </div>

                <md-field md-clearable class="md-toolbar-section-end">
                    <md-input placeholder="Search by name..." v-model="search" @input="searchOnTable" />
                </md-field>
            </md-table-toolbar>

<!--            <md-table-row>-->
<!--                <md-table-head md-numeric>ID</md-table-head>-->
<!--                <md-table-head>Callsign</md-table-head>-->
<!--                <md-table-head>UCID</md-table-head>-->
<!--                <md-table-head>Actions</md-table-head>-->
<!--            </md-table-row>-->

            <md-table-row slot="md-table-row" slot-scope="{ item }">
                <md-table-cell md-sort-by="id" md-label="#" md-numeric>{{item.id}}</md-table-cell>
                <md-table-cell md-sort-by="callsign" md-label="Callsign">{{item.callsign}}</md-table-cell>
                <md-table-cell md-sort-by="ucid" md-label="UCID">{{item.ucid}}</md-table-cell>
                <md-table-cell md-label="Actions">
                    <md-button @click="banPilot(item)" :id="item.ucid" v-show="item.banned === 0" class="md-raised md-accent" >Ban</md-button>
                    <md-button @click="unbanPilot(item)" :id="item.ucid + '_' + item.id" v-show="item.banned === 1" class="md-raised md-primary" >Unban</md-button>
                </md-table-cell>
            </md-table-row>
        </md-table>
    </div>
</template>

<script>
    import settings from 'electron-settings';
    import iziToast from "izitoast";

    const toLower = text => {
        return text.toString().toLowerCase();
    };

    const searchByName = (items, term) => {
        if (term) {
            return items.filter(item => toLower(item.callsign).includes(toLower(term)))
        }

        return items;
    };

    export default {
        data(){
            return {
                search: null,
                searched: [],
                selected: null,
                db: null,
                pilots: [],
            }
        },
        beforeMount() {
            const sqlite3 = require('sqlite3').verbose();
            const database = settings.get('application.database_path', null);
            if (database === null) {
                iziToast.error({
                    title: 'System',
                    message: 'Database file path not set',
                    position: 'topRight'
                });
                return;
            }
            this.db = new sqlite3.Database(database, sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                    iziToast.error({
                        title: 'System',
                        message: err.toString(),
                        position: 'topRight'
                    });
                } else {
                    console.log();
                    iziToast.info({
                        title: 'System',
                        message: 'Connected to the database',
                        position: 'topRight'
                    });
                }

            });
        },
        mounted() {
            const vm = this;
            if (this.db === null) {
                iziToast.error({
                    title: 'System',
                    message: 'Impossible to read database',
                    position: 'topRight'
                });
                return;
            }
            this.db.each("SELECT * FROM `pilots`", function(err, row) {
                vm.pilots.push({
                    id: row.id,
                    callsign: row.callsign,
                    ucid: row.ucid,
                    banned: row.banned
                });
            });
        },
        beforeDestroy() {
            if (this.db !== null) {
                this.db.close();
            }
        },
        methods: {
            created () {
                this.searched = this.pilots;
            },
            searchOnTable () {
                this.searched = searchByName(this.pilots, this.search);
            },
            banPilot(pilot){
                this.db.run(`UPDATE pilots SET banned=1 WHERE ucid='${pilot.ucid}'`, [], (err) => {
                    if (err) {
                        iziToast.error({
                            title: 'System',
                            message: err.toString(),
                            position: 'topRight'
                        });
                    } else {
                        document.getElementById(pilot.ucid).style.display = 'none';
                    }
                });
            },
            unbanPilot(pilot) {
                this.db.run(`UPDATE pilots SET banned=0 WHERE ucid='${pilot.ucid}'`, [], (err) => {
                    if (err) {
                        iziToast.error({
                            title: 'System',
                            message: err.toString(),
                            position: 'topRight'
                        });
                    } else {
                        document.getElementById(pilot.ucid + '_' + pilot.id).style.display = 'none';
                    }
                });
            },
        },
    }
</script>