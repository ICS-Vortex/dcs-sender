import Vue from "vue";
import Vuex from "vuex";
import settings from 'electron-settings';
import {remote} from 'electron';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        loading: false,
        alert: null,
        version: remote.app.getVersion(),
        authenticated: false,
        serial: settings.get('application.serial', null),
        amqp: null,
    },
    getters: {
        getAmqpConnectionData: (state) => {
            return state.amqp;
        },
    },
    mutations: {
        SET_LOADING: (state, load) => {
            state.loading = load;
        },
        SET_AUTHENTICATED: (state, auth) => {
            state.authenticated = auth;
        },
        SET_AMQP: (state, payload) => {
            state.amqp = payload;
        },
        RESET_SERIAL: (state) => {
            state.serial = null;
            settings.set('application.serial', null);
        },
    },
    actions: {
        startLoading: (context) => {
            context.commit('SET_LOADING', true);
        },
        stopLoading: (context) => {
            context.commit('SET_LOADING', false);
        },
        setAuthenticated: (context, authenticated) => {
            context.commit('SET_AUTHENTICATED', authenticated);
        },
        setAmqp: (context, payload) => {
            context.commit('SET_AMQP', payload);
        },
        resetSerial: (context) => {
            context.commit('RESET_SERIAL');
            context.commit('SET_AUTHENTICATED', false);
        },
    }
});
