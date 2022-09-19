/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import 'babel-polyfill';
import Vue from 'vue';
// @ts-ignore
import App from './App.vue';
import VTooltip from 'v-tooltip';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default.css';

import Ripple from 'vue-ripple-directive';

import VueRouter from 'vue-router';
import DashboardPlugin from './material-dashboard';

// Plugins
import Chartist from 'chartist';

// router setup
import routes from './routes/routes';

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  scrollBehavior: (to) => {
    if (to.hash) {
      return { selector: to.hash };
    } else {
      return { x: 0, y: 0 };
    }
  },
  linkExactActiveClass: 'nav-item active',
});

// global library setup
Vue.prototype.$Chartist = Chartist;
// plugin setup
Vue.use(VueRouter);
Vue.use(DashboardPlugin);

Ripple.zIndex = 99999999;
Vue.directive('ripple', Ripple);

Vue.use(VTooltip);
Vue.use(BootstrapVue);
Vue.use(VueMaterial);

new Vue({
  el: '#app',
  router,
  render: (h) => h(App),
});
