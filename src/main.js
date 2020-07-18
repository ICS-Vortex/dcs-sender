import Vue from 'vue';
import App from './App.vue';
import CompositionApi from "@vue/composition-api";
import vuetify from './plugins/vuetify';
import store from "./plugins/store";
import router from './router'
import 'izitoast/dist/css/iziToast.min.css';
import '@/assets/css/style.scss';
import log from 'electron-log';
import axios from 'axios';

Vue.config.productionTip = false;
Vue.prototype.$axios = axios;
let currentEnvironment = process.env.NODE_ENV || 'development';
Vue.prototype.$environment = currentEnvironment;
log.info(`Application works in ${currentEnvironment} mode`);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

switch (currentEnvironment) {
    case 'development':
        Vue.prototype.$host = 'http://vfp.site';
        break;
    case 'production':
        Vue.prototype.$host = 'https://vfpteam.com';
        break;
    default:
        Vue.prototype.$host = 'http://vfp.site';
}
Vue.prototype.$apiUrl = Vue.prototype.$host + '/api';

Vue.use(require('vue-moment'));
Vue.use(CompositionApi);

new Vue({
    store,
    vuetify,
    router,
    render: h => h(App)
}).$mount('#app');
