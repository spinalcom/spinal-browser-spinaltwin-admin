<template>
  <md-toolbar
    md-elevation="0"
    class="md-transparent"
    :class="{
      'md-toolbar-absolute md-white md-fixed-top': $route.meta.navbarAbsolute
    }"
  >
    <div class="md-toolbar-row">
      <!--<div class="md-toolbar-section-start">
        <h3 class="md-title">{{ $route.name }}</h3>
      </div>-->
      <div class="md-toolbar-section-end">
        <md-button
          class="md-just-icon md-round md-simple md-toolbar-toggle"
          :class="{ toggled: $sidebar.showSidebar }"
          @click="toggleSidebar"
        >
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </md-button>

        <div class="md-collapse">
          <md-list>
            <!--<md-list-item @click="changeLang('fr')">
              <img
                src="../../../../public/img/flags/FR.png"
                height="25"
                width="25"
              />
              <p class="hidden-lg hidden-md">Français</p>
            </md-list-item>
            <md-list-item @click="changeLang('en')">
              <img
                src="../../../../public/img/flags/GB.png"
                max-height="30"
                max-width="30"
              />
              <p class="hidden-lg hidden-md">Anglais</p>
            </md-list-item>-->
            <!--<md-list-item href="#/">
              <i class="material-icons">dashboard</i>
              <p class="hidden-lg hidden-md">Dashboard</p>
            </md-list-item>
            <md-list-item href="#/pages/user-profil">
              <i class="material-icons">person</i>
              <p class="hidden-lg hidden-md">Profile</p>
            </md-list-item>-->
          </md-list>
        </div>
      </div>
    </div>
  </md-toolbar>
</template>

<script>
export default {
  data() {
    return {
      selectedEmployee: "",
      employees: [
        "Jim Halpert",
        "Dwight Schrute",
        "Michael Scott",
        "Pam Beesly",
        "Angela Martin",
        "Kelly Kapoor",
        "Ryan Howard",
        "Kevin Malone"
      ]
    };
  },
  methods: {
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    minimizeSidebar() {
      if (this.$sidebar) {
        this.$sidebar.toggleMinimize();
      }
    },
    changeLang(lang) {
      this.$i18n.locale = lang;
      this.$router.push({ name: "Dashboard" });
    }
  }
};
</script>
