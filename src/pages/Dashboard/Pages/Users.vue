<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-primary">
          <div class="card-icon">
            <md-icon>group</md-icon>
          </div>
          <h4 class="title" v-if="display === false">
            Liste des utilisateurs
          </h4>
          <h4 class="title" v-if="display === true">
            Ajouter un utilisateur
          </h4>
          <md-button
            class="md-primary pull-right"
            @click="displayAdd"
            v-if="display === false && usr.group_user.level > 50"
            >Ajouter</md-button
          >
        </md-card-header>
        <md-card-content>
          <md-table
            v-if="display === false"
            :value="queriedData"
            :md-sort.sync="currentSort"
            :md-sort-order.sync="currentSortOrder"
            :md-sort-fn="customSort"
            class="paginated-table table-striped table-hover"
          >
            <md-table-toolbar>
              <md-field>
                <label for="pages">Par page</label>
                <md-select v-model="pagination.perPage" name="pages">
                  <md-option
                    v-for="item in pagination.perPageOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                    {{ item }}
                  </md-option>
                </md-select>
              </md-field>

              <!--<md-field>
                <md-input
                  type="search"
                  class="mb-3"
                  clearable
                  style="width: 200px"
                  placeholder="Search"
                  v-model="searchQuery"
                >
                </md-input>
              </md-field>-->
            </md-table-toolbar>

            <hr />
            <md-table-row slot="md-table-row" slot-scope="{ item }">
              <md-table-cell md-label="Nom d'utilisateur" md-sort-by="name">{{
                item.name
              }} {{
                item.firstaname
              }}</md-table-cell>
              <md-table-cell md-label="Profil d'utilisateur" md-sort-by="email">{{
                item.email
              }}</md-table-cell>
              <md-table-cell md-label="Profil d'utilisateur" md-sort-by="userProfileId">{{
                item.userProfileId
              }}</md-table-cell>
            </md-table-row>
          </md-table>
          <ValidationObserver ref="form" v-if="display === true">
            <form @submit.prevent="validate">
              <div>
                <div class="md-layout">
                  <div class="md-layout-item md-size-60 mt-4 md-small-size-100">
                    <ValidationProvider
                      name="name"
                      rules="required"
                      v-slot="{ passed, failed }"
                    >
                      <md-field
                        :class="[
                          { 'md-error': failed },
                          { 'md-valid': passed },
                          { 'md-form-group': true }
                        ]"
                      >
                        <label>Nom</label>
                        <md-input v-model="enterprise.name" type="text">
                        </md-input>

                        <slide-y-down-transition>
                          <md-icon class="error" v-show="failed">close</md-icon>
                        </slide-y-down-transition>
                        <slide-y-down-transition>
                          <md-icon class="success" v-show="passed"
                            >done</md-icon
                          >
                        </slide-y-down-transition>
                      </md-field>
                    </ValidationProvider>
                    <ValidationProvider
                      name="surname"
                      rules="required"
                      v-slot="{ passed, failed }"
                    >
                      <md-field
                        :class="[
                          { 'md-error': failed },
                          { 'md-valid': passed },
                          { 'md-form-group': true }
                        ]"
                      >
                        <label>Prénom</label>
                        <md-input v-model="enterprise.sigle" type="text">
                        </md-input>

                        <slide-y-down-transition>
                          <md-icon class="error" v-show="failed">close</md-icon>
                        </slide-y-down-transition>
                        <slide-y-down-transition>
                          <md-icon class="success" v-show="passed"
                            >done</md-icon
                          >
                        </slide-y-down-transition>
                      </md-field>
                    </ValidationProvider>
                    <ValidationProvider
                      name="email"
                      rules="required"
                      v-slot="{ passed, failed }"
                    >
                      <md-field
                        :class="[
                          { 'md-error': failed },
                          { 'md-valid': passed },
                          { 'md-form-group': true }
                        ]"
                      >
                        <label>Email</label>
                        <md-input v-model="enterprise.sigle" type="email">
                        </md-input>

                        <slide-y-down-transition>
                          <md-icon class="error" v-show="failed">close</md-icon>
                        </slide-y-down-transition>
                        <slide-y-down-transition>
                          <md-icon class="success" v-show="passed"
                            >done</md-icon
                          >
                        </slide-y-down-transition>
                      </md-field>
                    </ValidationProvider>
                    <br>
                    <ValidationProvider
                      name="userProfileId"
                      rules="required"
                    >
                      <multiselect
                      placeholder="Profil d'utilisateur"
                      label="name"
                      track-by="_id"
                      :options="group_user"
                      :multiple="true"
                      :taggable="true"
                    ></multiselect>
                    </ValidationProvider>
                  </div>
                </div>
              </div>
              <br />
              <md-card-actions>
                <div>
                  <md-button @click="cancelAdd" class="btn-next md-danger">
                    Annuler
                  </md-button>
                  <md-button type="submit" class="btn-next md-primary">
                    Enregistrer
                  </md-button>
                </div>
              </md-card-actions>
            </form>
          </ValidationObserver>
        </md-card-content>
        <md-card-actions md-alignment="space-between" v-if="display === false">
          <div class="">
            <p class="card-category">
              Showing {{ from + 1 }}
              to {{ to }}
              of {{ total }}
              entries
            </p>
          </div>
          <pagination
            class="pagination-no-border pagination-primary"
            v-model="pagination.currentPage"
            :per-page="pagination.perPage"
            :total="total"
          >
          </pagination>
        </md-card-actions>
      </md-card>
    </div>
  </div>
</template>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<script>
import { Pagination } from "@/components";
import Fuse from "fuse.js";
import Multiselect from "vue-multiselect";
// import { SlideYDownTransition } from "vue2-transitions";
// import Places from 'vue-places'
export default {
  name: "Users",
  components: { Pagination, Multiselect },
  data() {
    return {
      display: false,
      valid: true,
      image: "",
      usr: {},
      currentSort: "name",
      currentSortOrder: "asc",
      pagination: {
        perPage: 5,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
        total: 0
      },
      searchQuery: "",
      propsToSearch: ["name", "sigle"],
      searchedData: [],
      group_user: [],
      fuseSearch: null,
      rules: [
        value =>
          !value ||
          value.size < 2000000 ||
          "Avatar size should be less than 2 MB!"
      ],
      select: null,
      users: [
          {
              name: "Tom",
              firstname: "Jerry",
              email: "tom@jerry.com",
              userProfileId: "Access read/write to DATA ROOM and SPACE CENTER"
      },
      {
              name: "Progth",
              firstname: "Thomson",
              email: "progth@thomson.com",
              userProfileId: "Access read/write to DATA ROOM and SPACE CENTER"
      }
      ],
      enterprise: {
        name: "",
        sigle: ""
      }
    };
  },
  computed: {
    /***
     * Returns a page from the searched data or the whole data. Search is performed in the watch section below
     */
    queriedData() {
      let result = this.users;
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
        : this.users.length;
    }
  },
  created: function() {
    if (localStorage.getItem("userConnected")) {
      this.usr = JSON.parse(localStorage.getItem("userConnected"));
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
    displayAdd() {
      this.display = true;
    },
    cancelAdd() {
      this.display = false;
      this.$refs.form.reset();
    },
    handleImage(e) {
      const selectedImage = e.target.files[0];
      this.createBase64Image(selectedImage);
    },
    createBase64Image(fileObject) {
      const reader = new FileReader();
      reader.addEventListener("load", event => {
        this.user.picture_base64 = reader.result.toString();
      });
      reader.readAsDataURL(fileObject);
    },
  },
  mounted() {
    // Fuse search initialization.
    this.fuseSearch = new Fuse(this.users, {
      keys: ["name", "sigle"],
      threshold: 0.3
    });
  },
  watch: {
    /**
     * Searches through the table data by a given query.
     * NOTE: If you have a lot of data, it's recommended to do the search on the Server Side and only display the results here.
     * @param value of the query
     */
    searchQuery(value) {
      let result = this.users;
      if (value !== "") {
        result = this.fuseSearch.search(this.searchQuery);
      }
      this.searchedData = result;
    }
  }
};
</script>
<style lang="css" scoped>
.md-card .md-card-actions {
  border: 0;
  margin-left: 20px;
  margin-right: 20px;
}
</style>
