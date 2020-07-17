import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../pages/Home.vue'
import Settings from "../pages/Settings";
import Faq from "../pages/Faq";

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/faq',
        name: 'faq',
        component: Faq
    },
    {
        path: '/settings',
        name: 'settings',
        component: Settings
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export default router
