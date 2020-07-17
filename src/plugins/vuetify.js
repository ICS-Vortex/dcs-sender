import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        dark: true,
        themes: {
            dark: {
                primary: colors.cyan,
                secondary: colors.cyan.darken2,
                accent: colors.cyan.accent1,
                error: colors.red.darken3,
            },
        },
    },
});
