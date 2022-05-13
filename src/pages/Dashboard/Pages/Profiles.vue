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
                  {{ app.name }}
                </label>
              </md-table-cell>

              <md-table-cell
                md-label="Contextes d'accès"
                md-sort-by="contextList"
              >
                <label v-for="(cont, index) in item.buildContextList">
                  <template v-if="index > 0">,</template>
                  {{ cont.name }}
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
                  <div
                    class="md-layout-item md-size-100 mt-4 md-small-size-100"
                  >
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
                    <ValidationProvider name="name">
                      <label>Contextes généraux</label>
                      <div :key="item" v-for="item in contexteRequired">
                        <md-checkbox v-model="addScene" :value="item">
                          {{ item.info.name.get() }}</md-checkbox
                        >
                      </div>
                    </ValidationProvider>
                    <br />
                  </div>
                  <div class="md-layout-item md-size-50 mt-4 md-small-size-50">
                    <vue-good-table
                      :columns="columns"
                      :rows="appList"
                      :select-options="{ enabled: true }"
                      :search-options="{ enabled: true }"
                      :group-options="{
                        enabled: true,
                        collapsable: true,
                      }"
                      @on-selected-rows-change="selectApp"
                    />
                  </div>
                  <div class="md-layout-item md-size-50 mt-4 md-small-size-50">
                    <div :key="item" v-for="item in digitalContextListComputed">
                      <md-checkbox
                        v-model="profileData.buildContextList"
                        :value="item"
                      >
                        {{ item.name }}</md-checkbox
                      >
                    </div>
                    <!--<table
                      class="table table-striped table-hover"
                      v-if="digitalContextListComputed.length > 0"
                    >
                      <thead>
                        <tr>
                          <th>
                            <label class="form-checkbox">
                              <input
                                type="checkbox"
                                v-model="selectAll"
                                @click="select"
                              />
                              <i class="form-icon"></i>
                            </label>
                          </th>
                          <th style="font-size: 16px">Liste des contextes</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="i in digitalContextListComputed">
                          <td>
                            <label class="form-checkbox">
                              <input
                                type="checkbox"
                                :value="i"
                                v-model="profileData.contextList"
                              />
                              <i class="form-icon"></i>
                            </label>
                          </td>
                          <td>{{ i.name }}</td>
                        </tr>
                      </tbody>
                    </table>-->
                    <!--<h4 class="text-center text-primary" style="font-weight: bold">
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
              </md-table>-->
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
          <div class="md-layout" v-if="display === true">
            <!--<div class="md-layout-item md-size-50 mt-4 md-small-size-100">
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
            </div>-->
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
import "vue-good-table/dist/vue-good-table.css";
import { VueGoodTable } from "vue-good-table";
export default {
  name: "Profiles",
  components: { Pagination, SlideYDownTransition, Multiselect, VueGoodTable },
  props: {
    checked: {
      type: Boolean,
      default: false,
    },
    name: String,
    title: String,
    icon: String,
    disabled: Boolean,
  },
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
      selectAll: false,
      selectAllApps: false,
      selectedApps: [],
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
      list: [],
      contexteRequired: [],
      addScene: null,
      digitalGraph: SpinalGraph,
      digitalContextListComputed: [],
      sState: "",
      columns: [
        {
          label: "Applications",
          field: "name",
        },
        /*{
          label: "Type",
          field: "",
        },*/
      ],
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
    /*digitalContextListComputed() {
      return this.digitalContextList.map((res) => {
        return {
          id: res.info.id?.get(),
          name: res.info.name?.get() ?? "no name",
        };
      });
    },*/
  },
  mounted: function () {
    if (this.auto == "true" || this.auto == 1) {
      this.generate();
    }
  },
  created: async function () {
    const url = localStorage.getItem("digitalGraphURL");
    let i = 0;
    if (SpinalGraphService.getGraph() === undefined) {
      const graph = await spinalIO.load(
        localStorage.getItem("urlSpinalTwinGraph")
      );
      await SpinalGraphService.setGraph(graph);
    }
    if (url) {
      this.digitalGraph = await spinalIO.load(url);
      this.list = await this.digitalGraph.getChildren();
      this.profileContext = SpinalGraphService.getContext(
        USER_PROFILE_LIST_CONTEXT
      );

      await this.getApp();
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
    selectApp(params) {
      console.log(params);
      this.selectedApps = [];
      this.profileData.appList = [];
      if (!this.selectAllApps) {
        for (let i in params.selectedRows) {
          this.loadContext(params.selectedRows[i]);
          let res = {
            id: params.selectedRows[i].id,
            name: params.selectedRows[i].name,
            typeContext: params.selectedRows[i].type,
            originalIndex: params.selectedRows[i].originalIndex,
            vgtSelected: params.selectedRows[i].vgtSelected,
            vgt_id: params.selectedRows[i].vgt_id,
          };
          this.selectedApps.push(res);
        }
        this.profileData.appList = this.selectedApps;

        console.log(this.digitalContextListComputed);
      }
    },
    loadContext(app) {
      //,app
      this.digitalContextListComputed = [];
      let digitalContextList = [];
      let lists = this.list;
      lists.forEach((item) => {
        console.log(item);
        app.typeContext.forEach((element) => {
          if (item.info.type.get() === element) {
            if (digitalContextList.length === 0) {
              digitalContextList.push(item);
            } else {
              console.log("here");
              digitalContextList.filter(function (elem) {
                console.log(elem);
                console.log(
                  "comparaison",
                  elem.info.name.get(),
                  item.info.name.get()
                );
                if (elem.info.name.get() != item.info.name.get()) {
                  digitalContextList.push(item);
                }
              });
            }
          }
        });
      });

      console.log(digitalContextList);
      this.digitalContextListComputed = digitalContextList.map((res) => {
        return {
          id: res.info.id?.get(),
          name: res.info.name?.get() ?? "no name",
        };
      });
      console.log(this.digitalContextListComputed);
    },
    select() {
      this.selected = [];
      this.profiles.buildContextList = [];
      console.log(this.selected);
      if (!this.selectAll) {
        let contx;
        for (let i in this.digitalContextListComputed) {
          contx = {
            id: this.digitalContextListComputed[i].id,
            data: this.digitalContextListComputed[i].name,
          };
          this.selected.push(contx);
        }
        this.profiles.buildContextList = contx;
      }
    },
    openConfig(section) {
      this.configData = {
        data: null,
        role: null,
      };
      this.config = section;
    },
    async displayAdd(menu = "", item = null) {
      this.display = true;
      this.sState = menu;
      if (this.sState == "edit" && item != null) {
        console.log(item);
        this.profileData = item;
        await this.getApp();
      }
      if (this.sState == "detail" && item != null) {
        this.profileData = item;
      }
      if (this.sState == "add") {
        this.contexteRequired = this.list.filter((elt) => {
          if (elt.info.type.get() === "SpinalService") {
            return elt;
          }
        });
        console.log(this.contexteRequired);
        this.profileData = {
          name: null,
          appList: [],
          buildContextList: [],
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
      console.log(prof);
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
                id: el.id,
                name: el.name,
                originalIndex: el.originalIndex,
                vgtSelected: el.vgtSelected,
                vgt_id: el.vgt_id,
              };
            });
          }
          if (res.buildContextList.get()) {
            data.buildContextList = res.buildContextList.get().map((el) => {
              return {
                id: el.id,
                name: el.name,
              };
            });
          }
          this.profiles.push(data);
        });
      }
      console.log(this.profiles);
    },
    async getApp() {
      this.appList = [];
      const appContext = SpinalGraphService.getContext(
        SPINALTWIN_DESCRIPTION_CONTEXT
      );
      let apps = await SpinalGraphService.getChildrenInContext(
        appContext.info.id.get(),
        appContext.info.id.get()
      );
      if (apps.length > 0) {
        apps.map((res) => {
          let data = {
            name: null,
            children: [],
          };
          data.name = res.name.get();
          res.childrenIds.map(async (elt) => {
            const node = await SpinalGraphService.getNodeAsync(elt);
            console.log(node);
            let rep;
            if (this.sState == "edit") {
              this.profileData.appList.map((el) => {
                if (el.name === node.name.get()) {
                  console.log("count 1", el);
                  rep = {
                    id: node.id.get(),
                    name: node.name.get(),
                    typeContext: node.typeContext.get(),
                    originalIndex: el.originalIndex,
                    vgtSelected: el.vgtSelected,
                    vgt_id: el.vgt_id,
                  };
                } else if (el.name != node.name.get() && !el.originalIndex) {
                  console.log("comparaison", el.name, node.name.get());
                  rep = {
                    id: node.id.get(),
                    name: node.name.get(),
                    typeContext: node.typeContext.get(),
                  };
                }
              });
            } else {
              if (node.typeContext.get())
                rep = {
                  id: node.id.get(),
                  name: node.name.get(),
                  typeContext: node.typeContext.get(),
                };
            }
            if (rep != undefined) {
              data.children.push(rep);
            }
          });
          this.appList.push(data);
        });
      }

      console.log(this.appList);
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
      console.log(this.addScene);
      let scene = {
        id: this.addScene.info.id?.get(),
        name: this.addScene.info.name?.get() ?? "no name",
      };
      this.profileData.buildContextList.push(scene);
      console.log(this.profileData);
      const graphContext = new SpinalGraph("GraphContext");
      if (this.profileData.buildContextList.length > 0) {
        this.profileData.buildContextList.forEach(async (element) => {
          console.log(element);
          const contxNode = await this.digitalGraph.getContext(element.name);
          console.log("node", contxNode);
          graphContext.addContext(contxNode);
        });
      }
      if (this.profileData.appList.length > 0) {
        graphContext.info.add_attr("appsList", this.profileData.appList);
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
