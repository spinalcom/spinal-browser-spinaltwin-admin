<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-primary">
          <div class="card-icon">
            <md-icon>group</md-icon>
          </div>
          <h4 class="title" v-if="display === false">Liste des utilisateurs</h4>
          <h4 class="title" v-if="display === true">Ajouter un utilisateur</h4>
          <md-button class="md-primary pull-right" @click="displayAdd('add')"
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
              <md-table-cell md-label="Nom d'utilisateur" md-sort-by="name"
                >{{ item.name }} {{ item.firstname }}</md-table-cell
              >
              <md-table-cell md-label="Email" md-sort-by="email">{{
                item.email
              }}</md-table-cell>
              <md-table-cell
                md-label="Profil d'utilisateur"
                md-sort-by="userProfileId"
                >{{ item.userProfileId.name }}</md-table-cell
              >
              <md-table-cell md-label="Actions">
                <md-icon @click.native="displayAdd('edit', item)">edit</md-icon>
              </md-table-cell>
            </md-table-row>
          </md-table>
          <ValidationObserver ref="form" v-if="display === true">
            <form @submit.prevent="validate">
              <div>
                <div class="md-layout">
                  <div class="md-layout-item md-size-60 mt-4 md-small-size-100">
                    <ValidationProvider
                      name="firstname"
                      v-slot="{ passed, failed }"
                    >
                      <md-field
                        :class="[
                          { 'md-error': failed },
                          { 'md-valid': passed },
                          { 'md-form-group': true },
                        ]"
                      >
                        <label>Prénom</label>
                        <md-input v-model="userData.firstname" type="text">
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
                    <ValidationProvider name="name" v-slot="{ passed, failed }">
                      <md-field
                        :class="[
                          { 'md-error': failed },
                          { 'md-valid': passed },
                          { 'md-form-group': true },
                        ]"
                      >
                        <label>Nom</label>
                        <md-input v-model="userData.name" type="text">
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
                      v-slot="{ passed, failed }"
                    >
                      <md-field
                        :class="[
                          { 'md-error': failed },
                          { 'md-valid': passed },
                          { 'md-form-group': true },
                        ]"
                      >
                        <label>Email</label>
                        <md-input v-model="userData.email" type="email">
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
                    <br />
                    <ValidationProvider name="userProfileId">
                      <multiselect
                        v-model="userData.userProfileId"
                        placeholder="Profil d'utilisateur"
                        label="name"
                        track-by="id"
                        :options="group_user"
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
                  <md-button @click="saveUser" class="btn-next md-primary">
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
              Showing {{ from + 1 }} to {{ to }} of {{ total }}
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
<script>
import { Pagination } from "../../../components";
import Fuse from "fuse.js";
import Multiselect from "vue-multiselect";
import {
  USER_LIST_CONTEXT,
  USER_PROFILE_LIST_CONTEXT
} from "../../../../constant";
import { spinalIO } from "../../../services/spinalIO";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { SpinalTwinServiceUser } from "spinal-service-spinaltwin-admin";
/*import { extend } from "vee-validate";
import { required } from "vee-validate/dist/rules";
extend("required", required);*/
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
      userData: {
        firstname: "",
        name: "",
        email: "",
        userProfileId: null
      },
      userContext: null,
      users: [],
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
  created: async function() {
    const url = localStorage.getItem("digitalGraphURL");
    if (SpinalGraphService.getGraph() === undefined) {
      const graph = await spinalIO.load(
        localStorage.getItem("urlSpinalTwinGraph")
      );
      await SpinalGraphService.setGraph(graph);
    }
    if (url) {
      this.userContext = SpinalGraphService.getContext(USER_LIST_CONTEXT);
      await this.getProfiles();
      await this.getUser();
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
    displayAdd(menu = "", item = null) {
      this.display = true;
      if (menu == "edit" && item != null) {
        this.userData = item;
      }
      if (menu == "add") {
        this.userData = {
          firstname: null,
          name: null,
          email: null,
          userProfileId: null
        };
      }
    },
    async getUser() {
      this.users = [];
      const us = await SpinalGraphService.getChildrenInContext(
        this.userContext.info.id.get(),
        this.userContext.info.id.get()
      );
      if (us.length > 0) {
        us.forEach(res => {
          console.log(res);

          let data = {
            id: res.id.get(),
            firstname: res.firstname.get(),
            name: res.name.get(),
            email: res.email.get(),
            userProfileId: res.userProfileId.get()
          };

          this.users.push(data);
        });
      }
      console.log(this.users);
    },
    async getProfiles() {
      const profileContext = SpinalGraphService.getContext(
        USER_PROFILE_LIST_CONTEXT
      );
      this.group_user = await SpinalGraphService.getChildrenInContext(
        profileContext.info.id.get(),
        profileContext.info.id.get()
      );
    },
    async saveUser() {
      if (this.userData.id) {
        const res = SpinalTwinServiceUser.updateUser(
          this.userData,
          this.userData.id
        );
        console.log(res);
      } else {
        SpinalTwinServiceUser.createUser(this.userData);
      }
      this.display = false;
      this.getUser();
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
    }
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
