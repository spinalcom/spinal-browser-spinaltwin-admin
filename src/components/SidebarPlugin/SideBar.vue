<template>
  <div
    class="sidebar"
    :data-color="activeColor"
    :data-image="backgroundImage"
    :data-background-color="backgroundColor"
    :style="sidebarStyle"
  >
    <div class="logo" v-if="!idBuilding">
      <a
        href="https://www.spinalcom.com"
        class="simple-text logo-mini"
        target="_blank"
      >
        <div class="logo-img">
          <img :src="logo" />
        </div>
      </a>
      <a
        href="https://www.spinalcom.com"
        class="simple-text logo-normal"
        target="_blank"
      >
        <template v-if="$route.meta.rtlActive">{{ rtlTitle }}</template>
        <template v-else>{{ title }}</template>
      </a>
      <div class="navbar-minimize">
        <md-button
          id="minimizeSidebar"
          class="md-round md-just-icon md-transparent"
          @click="minimizeSidebar"
        >
          <i class="material-icons text_align-center visible-on-sidebar-regular"
            >more_vert</i
          >
          <i
            class="material-icons design_bullet-list-67 visible-on-sidebar-mini"
            >view_list</i
          >
        </md-button>
      </div>
    </div>
    <div class="logo" v-if="idBuilding && !building.picture_base64">
      <a class="simple-text logo-mini" target="_blank">
        <div class="logo-img">
          <img :src="regularImg" />
        </div>
      </a>
      <a
        href="https://www.spinalcom.com"
        class="simple-text logo-normal"
        target="_blank"
      >
      <label class="text-white" v-if="building.name.length >= 12"  style="
    font-size: 10px;
">{{ building.name }}</label>
        <template v-else>{{ building.name }}</template>
      </a>
      <div class="navbar-minimize">
        <md-button
          id="minimizeSidebar"
          class="md-round md-just-icon md-transparent"
          @click="minimizeSidebar"
        >
          <i class="material-icons text_align-center visible-on-sidebar-regular"
            >more_vert</i
          >
          <i
            class="material-icons design_bullet-list-67 visible-on-sidebar-mini"
            >view_list</i
          >
        </md-button>
      </div>
    </div>
    <div class="logo" v-if="idBuilding && building.picture_base64">
      <a class="simple-text logo-mini" target="_blank">
        <div class="logo-img">
          <img :src="building.picture_base64" />
        </div>
      </a>
      <a
        href="https://www.spinalcom.com"
        class="simple-text logo-normal"
        target="_blank"
      >
        <label class="text-white" v-if="building.name.length >= 12"  style="
    font-size: 10px;
">{{ building.name }}</label>
        <template v-else>{{ building.name }}</template>
      </a>
      <div class="navbar-minimize">
        <md-button
          id="minimizeSidebar"
          class="md-round md-just-icon md-transparent"
          @click="minimizeSidebar"
        >
          <i class="material-icons text_align-center visible-on-sidebar-regular"
            >more_vert</i
          >
          <i
            class="material-icons design_bullet-list-67 visible-on-sidebar-mini"
            >view_list</i
          >
        </md-button>
      </div>
    </div>
    <div class="sidebar-wrapper" ref="sidebarScrollArea">
      <slot></slot>
      <md-list class="nav">
        <slot name="links">
          <sidebar-item
            v-for="(link, index) in sidebarLinks"
            :key="link.name + index"
            :link="link"
          >
            <sidebar-item
              v-for="(subLink, index) in link.children"
              :key="subLink.name + index"
              :link="subLink"
            >
            </sidebar-item>
          </sidebar-item>
        </slot>
      </md-list>
    </div>
  </div>
</template>
<script>
// import { HTTP } from "../../http-constant";
export default {
  name: "sidebar",
  props: {
    title: {
      type: String,
      default: "SPINALCOM"
    },
    regularImg: {
      type: String,
      default: "./img/image_placeholder.jpg"
    },
    rtlTitle: {
      type: String,
      default: "توقيت الإبداعية"
    },
    activeColor: {
      type: String,
      default: "green",
      validator: value => {
        let acceptedValues = [
          "",
          "purple",
          "azure",
          "green",
          "orange",
          "danger",
          "rose"
        ];
        return acceptedValues.indexOf(value) !== -1;
      }
    },
    backgroundImage: {
      type: String,
      default: "./img/sidebar-2.jpg"
    },
    backgroundColor: {
      type: String,
      default: "black",
      validator: value => {
        let acceptedValues = ["", "black", "white", "red"];
        return acceptedValues.indexOf(value) !== -1;
      }
    },
    logo: {
      type: String,
      default: "./img/logo2.png"
    },
    sidebarLinks: {
      type: Array,
      default: () => []
    },
    autoClose: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    building: {},
    idBuilding: null
  }),
  created: function() {
    if (this.$route.name === "Buildings") {
      localStorage.removeItem("idBuilding");
    } else {
      this.idBuilding = localStorage.getItem("idBuilding");
      if (localStorage.getItem("idBuilding")) {
        this.getBuildingById(localStorage.getItem("idBuilding"));
      }
    }
  },
  provide() {
    return {
      autoClose: this.autoClose
    };
  },
  methods: {
    minimizeSidebar() {
      if (this.$sidebar) {
        this.$sidebar.toggleMinimize();
      }
    },
    getBuildingById(id) {
    }
  },
  computed: {
    sidebarStyle() {
      return {
        backgroundImage: `url(${this.backgroundImage})`
      };
    }
  },
  beforeDestroy() {
    this.building = null;
    if (this.$sidebar.showSidebar) {
      this.$sidebar.showSidebar = false;
    }
  }
};
</script>
<style>
@media (min-width: 992px) {
  .navbar-search-form-mobile,
  .nav-mobile-menu {
    display: none;
  }
}
</style>
