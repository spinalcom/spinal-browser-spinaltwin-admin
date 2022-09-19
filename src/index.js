"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("babel-polyfill");
const vue_1 = __importDefault(require("vue"));
// @ts-ignore
const App_vue_1 = __importDefault(require("./App.vue"));
const v_tooltip_1 = __importDefault(require("v-tooltip"));
const bootstrap_vue_1 = __importDefault(require("bootstrap-vue"));
require("bootstrap/dist/css/bootstrap.css");
require("bootstrap-vue/dist/bootstrap-vue.css");
const vue_material_1 = __importDefault(require("vue-material"));
require("vue-material/dist/vue-material.min.css");
require("vue-material/dist/theme/default.css");
const vue_ripple_directive_1 = __importDefault(require("vue-ripple-directive"));
const vue_router_1 = __importDefault(require("vue-router"));
const material_dashboard_1 = __importDefault(require("./material-dashboard"));
// Plugins
const chartist_1 = __importDefault(require("chartist"));
// router setup
const routes_1 = __importDefault(require("./routes/routes"));
// configure router
const router = new vue_router_1.default({
    routes: routes_1.default,
    scrollBehavior: (to) => {
        if (to.hash) {
            return { selector: to.hash };
        }
        else {
            return { x: 0, y: 0 };
        }
    },
    linkExactActiveClass: 'nav-item active',
});
// global library setup
vue_1.default.prototype.$Chartist = chartist_1.default;
// plugin setup
vue_1.default.use(vue_router_1.default);
vue_1.default.use(material_dashboard_1.default);
vue_ripple_directive_1.default.zIndex = 99999999;
vue_1.default.directive('ripple', vue_ripple_directive_1.default);
vue_1.default.use(v_tooltip_1.default);
vue_1.default.use(bootstrap_vue_1.default);
vue_1.default.use(vue_material_1.default);
new vue_1.default({
    el: '#app',
    router,
    render: (h) => h(App_vue_1.default),
});
//# sourceMappingURL=index.js.map