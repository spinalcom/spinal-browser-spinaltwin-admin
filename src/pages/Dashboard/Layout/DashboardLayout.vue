<template>
  <div
    class="wrapper"
    :class="[
      { 'nav-open': $sidebar.showSidebar },
      { rtl: $route.meta.rtlActive },
    ]"
  >
    <notifications></notifications>
    <side-bar
      :active-color="sidebarBackground"
      :background-image="sidebarBackgroundImage"
      :data-background-color="sidebarBackgroundColor"
    >
      <mobile-menu></mobile-menu>
      <template slot="links">
        <sidebar-item
          :link="{
            name: 'Digital Twin',
            icon: 'dashboard',
            path: '/dashboard',
          }"
        >
        </sidebar-item>
        <sidebar-item
          :link="{
            name: 'Profile utilisateur',
            icon: 'person',
            path: '/profiles',
          }"
        ></sidebar-item>
        <sidebar-item
          :link="{
            name: 'Profile application',
            icon: 'apps',
            path: '/appProfile',
          }"
        ></sidebar-item>
        <sidebar-item
          :link="{
            name: 'Synchronisation Admin',
            icon: 'autorenew',
            path: '/registerAppServer',
          }"
        ></sidebar-item>
        <!--<sidebar-item
          :link="{
            name: 'Informations identification',
            icon: 'contacts',
            path: '/credentials',
          }"
        ></sidebar-item>-->
        <sidebar-item
          :link="{ name: 'Organ List', icon: 'webhook', path: '/organ-list' }"
        ></sidebar-item>
        <sidebar-item
          :link="{ name: 'Application List', icon: 'apps', path: '/app-list' }"
        ></sidebar-item>
        <sidebar-item
          :link="{ name: 'API List', icon: 'api', path: '/api-list' }"
        ></sidebar-item>
      </template>
    </side-bar>
    <div class="main-panel">
      <top-navbar></top-navbar>

      <div
        :class="{ content: !$route.meta.hideContent }"
        @click="toggleSidebar"
      >
        <zoom-center-transition :duration="200" mode="out-in">
          <!-- your content here -->
          <router-view></router-view>
        </zoom-center-transition>
      </div>
      <content-footer v-if="!$route.meta.hideFooter"></content-footer>
    </div>
  </div>
</template>
<script>
/* eslint-disable no-new */
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";

function hasElement(className) {
  return document.getElementsByClassName(className).length > 0;
}

function initScrollbar(className) {
  if (hasElement(className)) {
    new PerfectScrollbar(`.${className}`);
    document.getElementsByClassName(className)[0].scrollTop = 0;
  } else {
    // try to init it later in case this component is loaded async
    setTimeout(() => {
      initScrollbar(className);
    }, 100);
  }
}

function reinitScrollbar() {
  let docClasses = document.body.classList;
  let isWindows = navigator.platform.startsWith("Win");
  if (isWindows) {
    // if we are on windows OS we activate the perfectScrollbar function
    initScrollbar("sidebar");
    initScrollbar("sidebar-wrapper");
    initScrollbar("main-panel");

    docClasses.add("perfect-scrollbar-on");
  } else {
    docClasses.add("perfect-scrollbar-off");
  }
}

import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import MobileMenu from "./Extra/MobileMenu.vue";
import { ZoomCenterTransition } from "vue2-transitions";
import SidebarItem from "../../../components/SidebarPlugin/SidebarItem.vue";

export default {
  components: {
    TopNavbar,
    ContentFooter,
    MobileMenu,
    ZoomCenterTransition,
    SidebarItem,
  },
  data() {
    return {
      usr: {},
      sidebarBackgroundColor: "black",
      sidebarBackground: "green",
      sidebarBackgroundImage: "./img/sidebar-2.jpg",
      sidebarMini: true,
      sidebarImg: true,
    };
  },
  created: function () {},
  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },
    minimizeSidebar() {
      if (this.$sidebar) {
        this.$sidebar.toggleMinimize();
      }
    },
    back() {
      const token = sessionStorage.getItem("tokenKey");
    },
  },
  updated() {
    reinitScrollbar();
  },
  mounted() {
    reinitScrollbar();
  },
  watch: {
    sidebarMini() {
      this.minimizeSidebar();
    },
  },
};
</script>
<style lang="scss">
$scaleSize: 0.95;
@keyframes zoomIn95 {
  from {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }
  to {
    opacity: 1;
  }
}
.main-panel .zoomIn {
  animation-name: zoomIn95;
}
@keyframes zoomOut95 {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }
}
.main-panel .zoomOut {
  animation-name: zoomOut95;
}
</style>
