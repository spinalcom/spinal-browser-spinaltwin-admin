<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-primary">
          <div class="card-icon">
            <md-icon v-if="sState != 'detail'">group</md-icon>
            <md-icon
              @click.native="cancelAdd"
              v-if="display === true && sState === 'detail'"
              >arrow_back</md-icon
            >
          </div>
          <h4 class="title" v-if="display === false">Liste de profiles</h4>
          <h4 class="title" v-if="display === true && sState === 'add'">
            Ajouter un profil d'utilisateurs
          </h4>
          <h4 class="title" v-if="display === true && sState === 'edit'">
            Modifier un profil d'utilisateur
          </h4>
          <h4 class="title" v-if="display === true && sState === 'detail'">
            Détail du profil d'utilisateur
          </h4>
          <md-button
            class="md-primary pull-right"
            v-if="display === false"
            @click="displayAdd('add')"
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
            </md-table-toolbar>

            <hr />
            <md-table-row slot="md-table-row" slot-scope="{ item }">
              <md-table-cell md-label="Intitulé" md-sort-by="name">{{
                item.name
              }}</md-table-cell>
              <md-table-cell
                md-label="Applications d'accès"
                md-sort-by="appList"
              >
                <label v-for="(app, index) in item.appList">
                  <template v-if="index > 0">,</template>
                  {{ app.data.name }}
                </label>
              </md-table-cell>

              <md-table-cell
                md-label="Contextes d'accès"
                md-sort-by="contextList"
              >
                <label v-for="(cont, index) in item.buildContextList">
                  <template v-if="index > 0">,</template>
                  {{ cont.data.name }}
                </label>
              </md-table-cell>
              <md-table-cell md-label="Actions">
                <md-icon
                  class="text-center text-primary"
                  @click.native="displayAdd('edit', item)"
                  >edit</md-icon
                >
                <md-icon
                  class="text-center text-primary"
                  @click.native="displayAdd('detail', item)"
                  >visibility</md-icon
                >
                <md-icon
                  class="text-center text-primary"
                  @click.native="displayAdd('detail', item)"
                  >delete</md-icon
                >
              </md-table-cell>
            </md-table-row>
          </md-table>
          <ValidationObserver
            ref="form"
            v-if="(display === true && sState === 'add') || sState === 'edit'"
          >
            <form @submit.prevent="validate">
              <div>
                <div class="md-layout">
                  <div class="md-layout-item md-size-45 mt-4 md-small-size-100">
                    <ValidationProvider name="name" v-slot="{ passed, failed }">
                      <md-field
                        :class="[
                          { 'md-error': failed },
                          { 'md-valid': passed },
                          { 'md-form-group': true },
                        ]"
                      >
                        <label>Intitulé</label>
                        <md-input v-model="profileData.name" type="text">
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
                    <div>
                      <h5 class="title">Liste d'application autorisées</h5>
                      <div class="md-layout" v-if="profileData.appList">
                        <div
                          v-for="ap in profileData.appList"
                          class="
                            md-layout-item md-size-50
                            mt-4
                            md-small-size-100
                          "
                        >
                          <md-card>
                            <md-card-content>
                              <label class="text-center">
                                {{ ap.data.name }}
                              </label>
                              <hr />
                              <label
                                class="text-primary text-center"
                                v-for="(el, index) in ap.role"
                              >
                                <template v-if="index > 0">,</template>
                                {{ el.name }}
                              </label>
                              <hr />
                              <div>
                                <md-icon
                                  class="text-center text-primary"
                                  @click.native="editConfig('app', ap)"
                                  >edit</md-icon
                                >
                                <md-icon
                                  class="text-center text-danger"
                                  @click.native="deleteConfig('app', ap)"
                                  >close</md-icon
                                >
                              </div>
                            </md-card-content>
                          </md-card>
                        </div>
                      </div>
                      <br />
                      <div v-if="profileData.appList.length < 1">
                        <h6 class="text-center text-gray">
                          Aucune application configurée
                        </h6>
                      </div>
                    </div>
                    <br />
                    <div>
                      <h5 class="title">Liste de contexte autorisées</h5>
                      <div
                        class="md-layout"
                        v-if="profileData.buildContextList"
                      >
                        <div
                          v-for="contx in profileData.buildContextList"
                          class="
                            md-layout-item md-size-50
                            mt-4
                            md-small-size-100
                          "
                        >
                          <md-card>
                            <md-card-content>
                              <label> {{ contx.data.name }} </label>
                              <hr />
                              <label
                                class="text-primary text-center"
                                v-for="(el, index) in contx.role"
                              >
                                <template v-if="index > 0">,</template>
                                {{ el.name }}
                              </label>
                              <hr />
                              <div>
                                <md-icon
                                  class="text-center text-primary"
                                  @click.native="editConfig('contexte', contx)"
                                  >edit</md-icon
                                >
                                <md-icon
                                  class="text-center text-danger"
                                  @click.native="
                                    deleteConfig('contexte', contx)
                                  "
                                  >close</md-icon
                                >
                              </div>
                            </md-card-content>
                          </md-card>
                        </div>
                      </div>
                      <br />
                      <div v-if="profileData.buildContextList.length < 1">
                        <h6 class="text-center text-gray">
                          Aucun contexte configurée
                        </h6>
                      </div>
                    </div>
                  </div>
                  <div class="md-layout-item md-size-55 mt-4 md-small-size-100">
                    <md-button
                      @click="openConfig('app')"
                      class="btn-next md-primary"
                    >
                      Configuration applications
                    </md-button>
                    <md-button
                      @click="openConfig('contexte')"
                      class="btn-next md-primary"
                    >
                      Configuration contextes
                    </md-button>
                    <br />
                    <br />
                    <ValidationProvider v-if="config === 'app'" name="appList">
                      <multiselect
                        v-model="configData.data"
                        :options="options"
                        group-values="apps"
                        group-label="nameGroup"
                        :group-select="true"
                        placeholder="Sélectionner les applications autorisés"
                        track-by="name"
                        label="name"
                      >
                        <span slot="noResult"
                          >Oops! No elements found. Consider changing the search
                          query.</span
                        >
                      </multiselect>
                    </ValidationProvider>
                    <ValidationProvider
                      v-if="config === 'contexte'"
                      name="buildContextList"
                    >
                      <multiselect
                        v-model="configData.data"
                        tag-placeholder="Add this as new tag"
                        placeholder="Sélectionner les contextes autorisés"
                        label="name"
                        track-by="id"
                        :options="digitalContextListComputed"
                        :taggable="true"
                      >
                        <span slot="noResult"
                          >Oops! No elements found. Consider changing the search
                          query.</span
                        >
                      </multiselect>
                    </ValidationProvider>
                    <br />
                    <ValidationProvider v-if="config" name="roleList">
                      <multiselect
                        v-model="configData.role"
                        tag-placeholder="Add this as new tag"
                        placeholder="Selectionner les accès autorisés"
                        label="name"
                        track-by="id"
                        :options="roleList"
                        :multiple="true"
                        :taggable="true"
                      >
                        <span slot="noResult"
                          >Oops! No elements found. Consider changing the search
                          query.</span
                        >
                      </multiselect>
                    </ValidationProvider>
                    <br />
                    <md-button
                      @click="saveConfig('app')"
                      v-if="config === 'app'"
                      class="btn-next md-primary"
                    >
                      Valider
                    </md-button>
                    <md-button
                      @click="saveConfig('contexte')"
                      v-if="config === 'contexte'"
                      class="btn-next md-primary"
                    >
                      Valider
                    </md-button>
                  </div>
                </div>
              </div>
              <hr />
              <md-card-actions>
                <div>
                  <md-button @click="cancelAdd" class="btn-next md-danger">
                    Annuler
                  </md-button>
                  <md-button @click="saveProfile" class="btn-next md-primary">
                    Enregistrer
                  </md-button>
                </div>
              </md-card-actions>
            </form>
          </ValidationObserver>
          <div class="md-layout" v-if="display === true && sState === 'detail'">
            <div class="md-layout-item md-size-50 mt-4 md-small-size-100">
              <h4 class="text-center text-primary" style="font-weight: bold">
                Liste d'applications autorisées
              </h4>
              <br />
              <md-table
                :value="profileData.appList"
                class="paginated-table table-striped table-hover"
              >
                <hr />
                <md-table-row slot="md-table-row" slot-scope="{ item }">
                  <md-table-cell md-label="Applications" md-sort-by="name"
                    ><span class="text-success" style="font-weight: bold">
                      {{ item.data.name }}
                    </span></md-table-cell
                  >
                  <md-table-cell md-label="Rôle d'accès">
                    <label v-for="(rol, index) in item.role">
                      <template v-if="index > 0">,</template>
                      <span class="text-primary">{{ rol.name }}</span>
                    </label>
                  </md-table-cell>
                </md-table-row>
              </md-table>
            </div>
            <div class="md-layout-item md-size-50 mt-4 md-small-size-100">
              <h4 class="text-center text-primary" style="font-weight: bold">
                Liste de contextes autorisées
              </h4>
              <br />
              <md-table
                :value="profileData.buildContextList"
                class="paginated-table table-striped table-hover"
              >
                <hr />
                <md-table-row slot="md-table-row" slot-scope="{ item }">
                  <md-table-cell md-label="Contextes" md-sort-by="name">
                    <span class="text-success" style="font-weight: bold">
                      {{ item.data.name }}
                    </span>
                  </md-table-cell>
                  <md-table-cell md-label="Rôle d'accès">
                    <label v-for="(rol, index) in item.role">
                      <template v-if="index > 0">,</template>
                      <span class="text-primary">{{ rol.name }}</span>
                    </label>
                  </md-table-cell>
                </md-table-row>
              </md-table>
            </div>
          </div>
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
import { spinalIO } from "../../../services/spinalIO";
import { SlideYDownTransition } from "vue2-transitions";
import Multiselect from "vue-multiselect";
import {
  SpinalGraph,
  SpinalGraphService,
} from "spinal-env-viewer-graph-service";
import { SpinalTwinServiceUserProfile } from "spinal-service-spinaltwin-admin";
import {
  USER_PROFILE_LIST_CONTEXT,
  ROLE_LIST_CONTEXT,
  SPINALTWIN_DESCRIPTION_CONTEXT,
  SPINALTWIN_ADMIN_SERVICE_APP_RELATION_TYPE_PTR_LST,
} from "../../../constant";
// import Places from 'vue-places'
export default {
  name: "Profiles",
  components: { Pagination, SlideYDownTransition, Multiselect },
  data() {
    return {
      config: "",
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
        total: 0,
      },
      options: [],
      value: [],
      searchQuery: "",
      propsToSearch: ["name", "sigle"],
      searchedData: [],
      fuseSearch: null,
      rules: [
        (value) =>
          !value ||
          value.size < 2000000 ||
          "Avatar size should be less than 2 MB!",
      ],
      select: null,
      profileData: {
        id: null,
        name: "",
        appList: [],
        buildContextList: [],
      },
      profiles: [],
      profileContext: null,
      digitalContextList: [],
      roleList: [],
      appList: [],
      configData: {
        data: null,
        role: null,
      },
      digitalGraph: SpinalGraph,
      sState: "",
    };
  },
  computed: {
    /***
     * Returns a page from the searched data or the whole data. Search is performed in the watch section below
     */
    queriedData() {
      let result = this.profiles;
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
        : this.profiles.length;
    },
    digitalContextListComputed() {
      return this.digitalContextList.map((res) => {
        return {
          id: res.info.id?.get(),
          name: res.info.name?.get() ?? "no name",
        };
      });
    },
  },
  created: async function () {
    const url = localStorage.getItem("digitalGraphURL");
    let list = [];
    let i = 0;
    if (SpinalGraphService.getGraph() === undefined) {
      const graph = await spinalIO.load(
        localStorage.getItem("urlSpinalTwinGraph")
      );
      await SpinalGraphService.setGraph(graph);
    }
    if (url) {
      console.log(url);
      this.digitalGraph = await spinalIO.load(url);
      console.log(await this.digitalGraph.getChildren());
      list = await this.digitalGraph.getChildren();
      for (i; i < list.length; i++) {
        this.digitalContextList.push(list[i]);
      }
      this.profileContext = SpinalGraphService.getContext(
        USER_PROFILE_LIST_CONTEXT
      );
      console.log(this.profileContext);

      await this.getApp();
      await this.getRoles();
      await this.getUserProfile();
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
    openConfig(section) {
      this.configData = {
        data: null,
        role: null,
      };
      this.config = section;
    },
    displayAdd(menu = "", item = null) {
      this.display = true;
      this.sState = menu;
      if (this.sState == "edit" && item != null) {
        console.log(item);
        this.profileData = item;
      }
      if (this.sState == "detail" && item != null) {
        this.profileData = item;
      }
      if (this.sState == "add") {
        this.profileData = {
          name: null,
          appList: [],
          buildContextList: [],
          roleList: [],
        };
      }
    },
    saveConfig(sect) {
      const checkIndex = (res) => res.data.name === this.configData.data.name;

      if (sect == "app") {
        console.log(this.configData);
        const index = this.profileData.appList.findIndex(checkIndex);
        if (index != -1) {
          console.log(index);
          this.profileData.appList.splice(index, 1, this.configData);
          console.log(this.profileData.appList);
        } else {
          this.profileData.appList.push(this.configData);
          this.configData = {
            data: null,
            role: null,
          };
        }
      }
      if (sect == "contexte") {
        const index = this.profileData.buildContextList.findIndex(checkIndex);
        if (index != -1) {
          console.log(index);
          this.profileData.buildContextList.splice(index, 1, this.configData);
          console.log(this.profileData.buildContextList);
        } else {
          this.profileData.buildContextList.push(this.configData);
          this.configData = {
            data: null,
            role: null,
          };
        }
      }
    },
    editConfig(sect, item) {
      this.config = sect;
      if (item) {
        this.configData = item;
      }
    },
    deleteConfig(sect, item) {
      if (item) {
        this.configData = item;
        const checkIndex = (res) => res.data.name === this.configData.data.name;
        if (sect === "app") {
          const index = this.profileData.appList.findIndex(checkIndex);
          if (index != -1) {
            console.log(index);
            this.profileData.appList.splice(index, 1);
          }
        }
        if (sect === "contexte") {
          const index = this.profileData.buildContextList.findIndex(checkIndex);
          if (index != -1) {
            console.log(index);
            this.profileData.buildContextList.splice(index, 1);
            console.log(this.profileData.buildContextList);
          }
        }
      }
    },
    async getUserProfile() {
      const prof = await SpinalGraphService.getChildrenInContext(
        this.profileContext.info.id.get(),
        this.profileContext.info.id.get()
      );
      if (prof.length > 0) {
        prof.map((res) => {
          let data = {
            id: null,
            name: null,
            appList: null,
            buildContextList: null,
          };
          data.id = res.id.get();
          data.name = res.name.get();
          if (res.appList.get()) {
            data.appList = res.appList.get().map((el) => {
              return {
                data: el.data,
                role: el.role,
              };
            });
          }
          if (res.buildContextList.get()) {
            data.buildContextList = res.buildContextList.get().map((el) => {
              return {
                data: el.data,
                role: el.role,
              };
            });
          }
          this.profiles.push(data);
        });
      }
      console.log(this.profiles);
    },
    async getRoles() {
      const roleContext = SpinalGraphService.getContext(ROLE_LIST_CONTEXT);
      const rules = await SpinalGraphService.getChildrenInContext(
        roleContext.info.id.get(),
        roleContext.info.id.get()
      );
      if (rules.length > 0) {
        rules.map((res) => {
          let data = {
            id: null,
            name: null,
          };
          data.id = res.id.get();
          data.name = res.name.get();
          this.roleList.push(data);
        });
      }
      console.log(this.roleList);
    },
    async getApp() {
      const appContext = SpinalGraphService.getContext(
        SPINALTWIN_DESCRIPTION_CONTEXT
      );
      this.appList = await SpinalGraphService.getChildrenInContext(
        appContext.info.id.get(),
        appContext.info.id.get()
      );
      this.options = await this.computedApplList(this.appList);
      console.log(this.options);
    },
    computedApplList(data) {
      return Promise.all(
        data.map(async (el) => {
          const child = await SpinalGraphService.getChildren(el.id.get());
          const ap = child.map((res) => {
            return {
              name: res.name._data,
              id: res.id._data,
            };
          });
          return {
            nameGroup: el.name.get(),
            idGroup: el.id.get(),
            apps: ap,
          };
        })
      );
    },
    async saveProfile() {
      this.profiles = [];
      console.log(this.profileData);
      const graphContext = new SpinalGraph("GraphContext");
      if (this.profileData.buildContextList.length > 0) {
        this.profileData.buildContextList.forEach(async (element) => {
          const contxNode = await this.digitalGraph.getContext(
            element.data.name
          );
          graphContext.addContext(contxNode);
        });
      }
      if (this.profileData.id) {
        const res = SpinalTwinServiceUserProfile.updateUserProfile(
          this.profileData,
          this.profileData.id,
          graphContext
        );
        console.log(res);
      } else {
        await SpinalTwinServiceUserProfile.createUserProfile(
          this.profileData,
          graphContext
        );
      }
      this.display = false;
      this.sState = null;
      this.getUserProfile();
    },
    cancelAdd() {
      this.display = false;
      this.sState = "";
      this.config = "";
    },
    handleImage(e) {
      const selectedImage = e.target.files[0];
      this.createBase64Image(selectedImage);
    },
    createBase64Image(fileObject) {
      const reader = new FileReader();
      reader.addEventListener("load", (event) => {
        this.user.picture_base64 = reader.result.toString();
      });
      reader.readAsDataURL(fileObject);
    },
  },
  mounted() {
    // Fuse search initialization.
    this.fuseSearch = new Fuse(this.profiles, {
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
      let result = this.profiles;
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
