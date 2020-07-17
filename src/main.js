import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router'
import axios from 'axios';
import 'izitoast/dist/css/iziToast.min.css';
import '@/assets/css/style.scss';
import log from 'electron-log';
import https from 'https';

Vue.config.productionTip = false;
Vue.use(require('vue-moment'));
https.globalAgent.options.rejectUnauthorized = false;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

Vue.prototype.$axios = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: true
    })
});
let currentEnvironment = process.env.NODE_ENV || 'development';
Vue.prototype.$environment = currentEnvironment;
log.info(`Application works in ${currentEnvironment} mode`);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

currentEnvironment = 'production';

switch (currentEnvironment) {
    case 'development':
        Vue.prototype.$host = 'http://vfp.site';
        Vue.prototype.$amqpVHost = '/';
        Vue.prototype.$amqpHost = 'localhost';
        Vue.prototype.$amqpPort = 5672;
        Vue.prototype.$amqpUsername = 'vfp';
        Vue.prototype.$amqpPassword = '62103128';
        break;
    case 'production':
        Vue.prototype.$host = 'https://vfpteam.com';
        Vue.prototype.$amqpVHost = '/';
        Vue.prototype.$amqpHost = 'vfpteam.com';
        Vue.prototype.$amqpPort = 5672;
        Vue.prototype.$amqpUsername = 'vfpteam.com';
        Vue.prototype.$amqpPassword = 'Csp0tFlight!';
        break;
    default:
        Vue.prototype.$host = 'http://vfp.site';
        Vue.prototype.$amqpVHost = '/';
        Vue.prototype.$amqpHost = 'localhost';
        Vue.prototype.$amqpPort = 5672;
        Vue.prototype.$amqpUsername = 'vfp';
        Vue.prototype.$amqpPassword = '62103128';
}
Vue.prototype.$apiUrl = Vue.prototype.$host + '/api';

new Vue({
    vuetify,
    router,
    render: h => h(App)
}).$mount('#app');
