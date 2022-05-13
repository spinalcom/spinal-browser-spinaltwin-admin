<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-primary">
          <div class="card-icon">
            <md-icon>group</md-icon>
          </div>
          <h4 class="title">Admin Platform Credential and Send Data</h4>
        </md-card-header>
        <md-card-content>
          <ValidationObserver ref="form">
            <form @submit.prevent="validate">
              <div>
                <div class="md-layout">
                  <div class="md-layout-item md-size-60 mt-4 md-small-size-100">
                    <multiselect
                      v-model="credential.name"
                      :options="platformList"
                      placeholder="Selectionnez la plateforme"
                      label="name"
                      track-by="name"
                    ></multiselect>
                    <br />
                    <ValidationProvider
                      name="clientId"
                      v-slot="{ passed, failed }"
                    >
                      <md-field
                        :class="[
                          { 'md-error': failed },
                          { 'md-valid': passed },
                          { 'md-form-group': true },
                        ]"
                      >
                        <label>Identifiant de la plateforme Admin</label>
                        <md-input v-model="credential.clientId" type="text">
                        </md-input>
                        <md-button
                          class="md-icon-button md-white"
                          @click="generate(10, 'id')"
                        >
                          <md-icon>autorenew</md-icon>
                        </md-button>
                      </md-field>
                    </ValidationProvider>
                    <ValidationProvider
                      name="clienSecret"
                      v-slot="{ passed, failed }"
                    >
                      <md-field
                        :md-toggle-password="false"
                        :class="[
                          { 'md-error': failed },
                          { 'md-valid': passed },
                          { 'md-form-group': true },
                        ]"
                      >
                        <label>Mot de passe client</label>
                        <md-input
                          v-if="showPassword"
                          v-model="credential.clientSecret"
                        >
                        </md-input>
                        <md-input
                          v-else
                          v-model="credential.clientSecret"
                          type="password"
                        >
                        </md-input>

                        <md-button
                          @click="toggleShow"
                          class="md-icon-button md-white"
                        >
                          <md-icon v-if="showPassword">visibility_off</md-icon>

                          <md-icon v-else>visibility</md-icon>
                        </md-button>

                        <md-button
                          class="md-icon-button md-white"
                          @click="generate(32, 'secret')"
                        >
                          <md-icon>autorenew</md-icon>
                        </md-button>
                      </md-field>
                    </ValidationProvider>
                  </div>
                </div>
              </div>
              <br />
              <md-card-actions>
                <div>
                  <md-button class="btn-next md-danger"> Annuler </md-button>
                  <md-button class="btn-next md-primary">
                    Enregistrer
                  </md-button>
                </div>
              </md-card-actions>
            </form>
          </ValidationObserver>
        </md-card-content>
      </md-card>
    </div>
  </div>
</template>
<script>
import { Pagination } from "../../../components";
import Fuse from "fuse.js";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { SpinalTwinServiceRole } from "spinal-service-spinaltwin-admin";
import { spinalIO } from "../../../services/spinalIO";
import Multiselect from "vue-multiselect";
import VuePassword from "vue-password";
import {
  ROLE_LIST_CONTEXT,
  SPINALTWIN_ADMIN_SERVICE_APP_RELATION_TYPE_PTR_LST,
} from "../../../constant";
// import { SlideYDownTransition } from "vue2-transitions";
// import Places from 'vue-places'
export default {
  name: "Roles",
  components: { Pagination, Multiselect, VuePassword },
  props: {
    type: {
      type: String,
      default: "text",
    },
    size: {
      type: String,
      default: "32",
    },
    characters: {
      type: String,
      default: "a-z,A-Z,0-9",
    },
    placeholder: {
      type: String,
      default: "Password",
    },
    auto: [String, Boolean],
    value: "",
  },
  data() {
    return {
      currentSort: "name",
      currentSortOrder: "asc",
      pagination: {
        perPage: 5,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
        total: 0,
      },
      searchQuery: "",
      propsToSearch: ["name", "sigle"],
      searchedData: [],
      credential: {
        name: null,
        clientId: null,
        clientSecret: null,
      },
      showPassword: false,
      fuseSearch: null,
      platformList: [
        {
          name: "SPINALTWIN",
        },
        {
          name: "ADMIN APP SERVER",
        },
      ],
      rules: [
        (value) =>
          !value ||
          value.size < 2000000 ||
          "Avatar size should be less than 2 MB!",
      ],
      password: this.value,
    };
  },
  mounted: function () {
    if (this.auto == "true" || this.auto == 1) {
      this.generate();
    }
  },
  computed: {
    /***
     * Returns a page from the searched data or the whole data. Search is performed in the watch section below
     */
    queriedData() {
      let result = this.roles;
      if (this.searchedData.length > 0) {
        result = this.searchedData;
      }
      return result.slice(this.from, this.to);
    },
    to() {
      let highBound = this.from + this.pagination.perPage;
      if (this.total < highBound) {
        highBound = this.total;
      }
      return highBound;
    },
    from() {
      return this.pagination.perPage * (this.pagination.currentPage - 1);
    },
    total() {
      return this.searchedData.length > 0
        ? this.searchedData.length
        : this.roles.length;
    },
  },
  created: async function () {
    const url = localStorage.getItem("digitalGraphURL");
    if (SpinalGraphService.getGraph() === undefined) {
      const graph = await spinalIO.load(
        localStorage.getItem("urlSpinalTwinGraph")
      );
      await SpinalGraphService.setGraph(graph);
    }
    if (url) {
      console.log(url);
    }
  },
  methods: {
    customSort(value) {
      return value.sort((a, b) => {
        const sortBy = this.currentSort;
        if (this.currentSortOrder === "desc") {
          return a[sortBy].localeCompare(b[sortBy]);
        }
        return b[sortBy].localeCompare(a[sortBy]);
      });
    },
    generate(size, input) {
      let charactersArray = this.characters.split(",");
      let CharacterSet = "";
      let password = "";

      if (charactersArray.indexOf("a-z") >= 0) {
        CharacterSet += "abcdefghijklmnopqrstuvwxyz";
      }
      if (charactersArray.indexOf("A-Z") >= 0) {
        CharacterSet += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      }
      if (charactersArray.indexOf("0-9") >= 0) {
        CharacterSet += "0123456789";
      }
      if (charactersArray.indexOf("#") >= 0) {
        CharacterSet += "![]{}()%&*$#^<>~@|";
      }

      for (let i = 0; i < size; i++) {
        password += CharacterSet.charAt(
          Math.floor(Math.random() * CharacterSet.length)
        );
      }
      if (input === "id") {
        this.credential.clientId = password;
      } else {
        this.credential.clientSecret = password;
      }
    },
    toggleShow() {
      this.showPassword = !this.showPassword;
    },
  },
  mounted() {
    // Fuse search initialization.
    this.fuseSearch = new Fuse(this.roles, {
      keys: ["name", "sigle"],
      threshold: 0.3,
    });
  },
  watch: {
    /**
     * Searches through the table data by a given query.
     * NOTE: If you have a lot of data, it's recommended to do the search on the Server Side and only display the results here.
     * @param value of the query
     */
    searchQuery(value) {
      let result = this.roles;
      if (value !== "") {
        result = this.fuseSearch.search(this.searchQuery);
      }
      this.searchedData = result;
    },
  },
};
</script>
<style lang="css" scoped>
.md-card .md-card-actions {
  border: 0;
  margin-left: 20px;
  margin-right: 20px;
}
</style>
