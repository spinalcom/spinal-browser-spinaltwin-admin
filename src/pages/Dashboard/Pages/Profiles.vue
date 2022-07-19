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
                  @click.native="displayAdd('delete', item)"
                  >delete</md-icon
                >
              </md-table-cell>
            </md-table-row>
          </md-table>
          <div
            ref="form"
            v-if="(display === true && sState === 'add') || sState === 'edit'"
          >
            <form @submit.prevent="validate">
              <div>
                <div class="md-layout">
                  <div
                    class="md-layout-item md-size-100 mt-4 md-small-size-100"
                  >
                  <md-field
                      >
                        <label>Intitulé</label>
                        <md-input v-model="profileData.name" type="text">
                        </md-input>
                      </md-field>
                    <br />
                  </div>
                  <div
                    class="md-layout-item md-size-100 mt-4 md-small-size-100"
                  >
                      <label>Contextes généraux</label>
                      <div>
                        <md-checkbox
                          v-for="it in contexteRequired"
                          v-model="addScene"
                          :value="it"
                          :true-value="it"
                          disabled
                          @hook:mounted="setCheckedGeneralContext(it)"
                          checked
                        >
                          {{ it.info.name.get() }}</md-checkbox
                        >
                      </div>
                    <br />
                  </div>
                  <div class="md-layout-item md-size-50 mt-4 md-small-size-50">
                    <vue-good-table
                      :columns="columns"
                      :rows="appList"
                      :select-options="{ enabled: true }"
                      :search-options="{ enabled: true }"
                      @on-selected-rows-change="selectApp"
                    >
                      <template slot="table-row" slot-scope="props">
                        <span
                          v-if="enable == true && props.row.name == row.name"
                        >
                          <span style="font-weight: bold; color: blue">{{
                            props.row.name
                          }}</span>
                        </span>
                        <span v-else>
                          {{ props.formattedRow[props.column.field] }}
                        </span>
                      </template>
                    </vue-good-table>
                  </div>
                  <div
                    class="md-layout-item md-size-50 mt-4 md-small-size-50"
                  >
                  <div v-if="contextList">
                      <vue-good-table
                        :columns="columns2"
                        :rows="contextList"
                        :select-options="{ enabled: true }"
                        :search-options="{ enabled: true }"
                        @on-selected-rows-change="select"
                      />
                    </div>
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
import Swal from "sweetalert2";
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
      updateProfileData: [],
      profiles: [],
      listUpdate: [],
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
      addScene: [],
      digitalGraph: SpinalGraph,
      sState: "",
      enable: false,
      row: null,
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
       columns2: [
        {
          label: "Context",
          field: "name",
        },
      ],
      contextList: [],
      sendRequiredCont: []
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
          type: res.info.type?.get()
        };
      });
    },
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
      console.log(this.digitalGraph)
      this.profileContext = SpinalGraphService.getContext(
        USER_PROFILE_LIST_CONTEXT
      );

      this.list = await this.digitalGraph.getChildren();
      for (i; i < this.list.length; i++) {
        this.digitalContextList.push(this.list[i]);
      }
       let cont = this.digitalContextList.filter((elt) => {
          if (elt.info.type?.get() != "SpinalService" &&
          elt.info.type?.get() != "geographicContext" &&
          elt.info.type?.get() != "SpinalContext" ) {
            return elt;
          }
       });
       this.digitalContextList = cont;
      await this.getContextDigitalTwin();
      await this.getApp();
      // await this.createProfileDefault(this.list, this.appList)
      await this.getUserProfile();
    }
  },
  methods: {
    /*async createProfileDefault(contextList, appList) {
      let profile1 = {
          id: null,
          name: "BOS Admin",
          appList: [],
          buildContextList: []
        
      }
      let profile2 = {
          id: null,
          name: "BOS Integrator",
          appList: [],
          buildContextList: []
        
      }
      let profile3 = {
          id: null,
          name: "Workplace Manager",
          appList: [],
          buildContextList: []
        
      }
      let profile4 = {
          id: null,
          name: "Facility Manager",
          appList: [],
          buildContextList: []
        
      }
      let profile5 = {
          id: null,
          name: "Custom user",
          appList: [],
          buildContextList: []
        
      }
      let cont = [];
      contextList.map((elt) => {
        if (elt.info.type?.get() === "SpinalService" ||
          elt.info.type?.get() === "geographicContext" ||
          elt.info.type?.get() === "SpinalContext") {
            let data = {
              id: elt.info.id?.get(),
              name: elt.info.name?.get() ?? "no name",
              type: elt.info.type?.get(),
            };
            profile1.buildContextList.push(data);
            profile2.buildContextList.push(data);
            profile3.buildContextList.push(data);
            profile4.buildContextList.push(data);
            profile5.buildContextList.push(data);
          }
      });

      appList.map((elt) => {
        console.log(elt)
        if (elt.name === 'Description') {
            profile1.appList.push(elt);
            profile2.appList.push(elt);
            profile3.appList.push(elt);
            profile4.appList.push(elt);
            profile5.appList.push(elt);
        }
      })

      console.log(profile1, profile2, profile3, profile4, profile5);
    },*/
    customSort(value) {
      return value.sort((a, b) => {
        const sortBy = this.currentSort;
        if (this.currentSortOrder === "desc") {
          return a[sortBy].localeCompare(b[sortBy]);
        }
        return b[sortBy].localeCompare(a[sortBy]);
      });
    },
    setChecked(ind) {
      this.updateProfileData.push(ind);
    },
    setCheckedGeneralContext(ind) {
      this.addScene.push(ind);
    },

    selectApp(params) {
      this.selectedApps = [];
      this.profileData.appList = [];
      if (!this.selectAllApps) {
        for (let i in params.selectedRows) {
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
      }
    },
     select(params) {
      console.log(params)
      this.sendRequiredCont = [];
      this.selected = [];
      this.profileData.buildContextList = [];
      if (!this.selectAll) {
        let contx;
        for (let i in params.selectedRows) {
          contx = {
            id: params.selectedRows[i].id,
            name: params.selectedRows[i].name,
            type: params.selectedRows[i].type,
            originalIndex: params.selectedRows[i].originalIndex,
            vgtSelected: params.selectedRows[i].vgtSelected,
            vgt_id: params.selectedRows[i].vgt_id,
          };
          this.selected.push(contx);
        }
        this.profileData.buildContextList = this.selected;
        if (params.selectedRows.length <= 0) {
          if (this.profileData.buildContextList.length <= 0) {
             this.sendRequiredCont = this.addScene;
          } else {
             if (this.sState == 'edit') {
                this.sendRequiredCont = [];
              }
          }
        } else {
          console.log(this.addScene);
            this.sendRequiredCont = this.addScene;
        }
            console.log(this.sendRequiredCont)
      }
    },

    async getContextDigitalTwin() {
      this.contextList = [];
      let rep = {};
      if (this.sState === "edit") {
        this.digitalContextListComputed.map((node) => {
          this.profileData.buildContextList.map((el) => {
                  if (el.name === node.name) {
                    rep = {
                      id: node.id,
                      name: node.name,
                      type: node.type,
                      originalIndex: el.originalIndex,
                      vgtSelected: el.vgtSelected,
                      vgt_id: el.vgt_id,
                    };
                  }
                  if (el.name != node.name) {
                          rep = {
                            id: node.id,
                            name: node.name,
                            type: node.type
                          };
                  }

                  if (rep != undefined) {
                    let found = false;
                      for(let i = 0; i < this.contextList.length; i++) {
                          if (this.contextList[i].name === rep.name) {
                             if (rep.originalIndex) {
                              this.contextList[i] = rep;
                             }
                              found = true;
                              break;
                          }
                      }
                    if (found == false) {
                      this.contextList.push(rep);
                    }
                  }
                })
        });
      } else {
        this.contextList = this.digitalContextListComputed;
      }
    },

    async displayAdd(menu = "", item = null) {
      this.display = true;
      this.sState = menu;
      this.addScene = [];
      this.sendRequiredCont = [];

      this.contexteRequired = this.list.filter((elt) => {
        if (
          elt.info.type.get() === "SpinalService" ||
          elt.info.type.get() === "geographicContext" ||
          elt.info.type.get() === "SpinalContext"
        ) {
          return elt;
        }
      });
      if (this.sState == "edit" && item != null) {
        this.sendRequiredCont = [];
        this.profileData = item;
        console.log(this.profileData);
        await this.getContextDigitalTwin();
        await this.getApp();
      }
      if (this.sState == "detail" && item != null) {
        this.profileData = item;
      }
      if  (this.sState == "delete" && item != null) {
        Swal.fire({
        title: 'Supprimer ce profil?',
        showDenyButton: true,
        confirmButtonText: 'Valider',
        denyButtonText: `Annuler`,
      }).then(async (result) => {
        if (result.isConfirmed) {
          await SpinalGraphService.removeFromGraph(item.id);
          Swal.fire('Supprimé!', '', 'success')
          this.profiles = [];
          await this.getUserProfile();
          await this.getContextDigitalTwin();
          await this.getApp()
        }
      });
          this.sState = "";
          this.display = false;
      }
      if (this.sState == "add") {
        this.sendRequiredCont = this.addScene;
        this.profileData = {
          name: null,
          appList: [],
          buildContextList: [],
        };
      }
    },
    async getUserProfile() {
      this.sendRequiredCont = [];
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
          data.name = res.name?.get();
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
                type: el.type,
                originalIndex: el.originalIndex,
                vgtSelected: el.vgtSelected,
                vgt_id: el.vgt_id,
              };
            });
          }
          this.profiles.push(data);
        });
      }
      console.log(this.profiles)
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
          res.childrenIds.map(async (elt) => {
            const node = await SpinalGraphService.getNodeAsync(elt);
            let rep;
            if (this.sState === "edit") {
              if (this.profileData.appList.length > 0) {
                this.profileData.appList.map((el) => {
                  if (el.name === node.name?.get()) {
                    console.log("coché", el)
                    rep = {
                      id: node.id?.get(),
                      name: node.name?.get(),
                      typeContext: node.typeContext?.get(),
                      originalIndex: el.originalIndex,
                      vgtSelected: el.vgtSelected,
                      vgt_id: el.vgt_id,
                    };
                    this.appList.push(rep);
                  } 
                  if (el.name != node.name?.get()) {
                    rep = {
                      id: node.id.get(),
                      name: node.name.get(),
                      typeContext:  node.typeContext?.get(),
                    };
                  }
                });
              } else {
                rep = {
                  id: node.id.get(),
                  name: node.name.get(),
                  typeContext: node.typeContext?.get()
              }
            }
            } else {
                rep = {
                  id: node.id.get(),
                  name: node.name.get(),
                  typeContext: node.typeContext?.get()
              }
            }

              if (rep != undefined) {
                let found = false;
                        for(let i = 0; i < this.appList.length; i++) {
                            if (this.appList[i].name === rep.name) {
                              if (rep.originalIndex) {
                                this.appList[i] = rep;
                              }
                                found = true;
                                break;
                            }
                        }
                      if (found == false) {
                        this.appList.push(rep);
                      }
              }
          });
        });
      }
      console.log(this.appList);
    },
    async saveProfile() {
      console.log(this.profileData);
      console.log(this.sendRequiredCont);
      this.profiles = [];
      if (this.profileData.name) {
        if (this.sendRequiredCont.length > 0) {
          this.sendRequiredCont.forEach((element) => {
              let scene = {
                id: element.info.id?.get(),
                name: element.info.name?.get() ?? "no name",
                type: element.info.type?.get(),
              };
              this.profileData.buildContextList.push(scene);
            });
        }
        const graphContext = new SpinalGraph("GraphContext");
        if (this.profileData.buildContextList.length > 0) {
          this.profileData.buildContextList.forEach(async (element) => {
            const contxNode = await this.digitalGraph.getContext(element.name);
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
          Swal.fire({
                  title: "Beau travail",
                  text: "Le profil d'utilisateur a bien été modifié",
                  type: "success",
                  confirmButtonClass: "md-button md-primary",
                  buttonsStyling: false
                });
        } else {
          await SpinalTwinServiceUserProfile.createUserProfile(
            this.profileData,
            graphContext
          );
          Swal.fire({
                  title: "Beau travail",
                  text: "Le profil d'utilisateur a bien été enregistré",
                  type: "success",
                  confirmButtonClass: "md-button md-primary",
                  buttonsStyling: false
                });
        }
        this.display = false;
        this.sState = null;
        this.addScene = [];
        await this.getUserProfile();
        await this.getContextDigitalTwin();
        await this.getApp()
        this.profileData = null;
        this.enable = false;
      } else {
         Swal.fire({
                  title: "Champs manquants",
                  text: "Veuillez renseigner tous les champs",
                  type: "error",
                  confirmButtonClass: "md-button md-danger",
                  buttonsStyling: false
                });
      }
    },
    async cancelAdd() {
      this.display = false;
      this.sState = "";
      this.config = "";
      this.profileData = null;
      this.enable = false;
      this.contextList = [];
      this.appList = [];
      this.profiles = [];
      this.addScene = [];
      await this.getUserProfile();
      await this.getContextDigitalTwin();
      await this.getApp()
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
