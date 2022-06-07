<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-primary">
          <div class="card-icon">
            <md-icon v-if="sState != 'detail'">apps</md-icon>
            <md-icon
              @click.native="cancelAdd"
              v-if="display === true && sState === 'detail'"
              >arrow_back</md-icon
            >
          </div>
          <h4 class="title" v-if="display === false">Liste de profiles</h4>
          <h4 class="title" v-if="display === true && sState === 'add'">
            Ajouter un profil d'application
          </h4>
          <h4 class="title" v-if="display === true && sState === 'edit'">
            Modifier un profil d'application
          </h4>
          <h4 class="title" v-if="display === true && sState === 'detail'">
            Détail du profil d'application
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

              <md-table-cell md-label="Routes d'accès" md-sort-by="tagsList">
                <label v-for="(tag, index) in item.tagsList.slice(0, 2)">
                  {{ tag.name }}
                  <template v-if="item.tagsList.length > 2 && index > 0"
                    >...</template
                  >
                </label>
              </md-table-cell>
              <md-table-cell
                md-label="Contextes d'accès"
                md-sort-by="contextList"
              >
                <label v-for="(cont, index) in item.contextList">
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
                    <!--<ValidationProvider
                      name="fileSwagger"
                      v-slot="{ passed, failed }"
                    >
                      <md-field
                        :class="[
                          { 'md-error': failed },
                          { 'md-valid': passed },
                          { 'md-form-group': true },
                        ]"
                      >
                        <md-input @change="readFile" type="file"> </md-input>

                        <slide-y-down-transition>
                          <md-icon class="error" v-show="failed">close</md-icon>
                        </slide-y-down-transition>
                        <slide-y-down-transition>
                          <md-icon class="success" v-show="passed"
                            >done</md-icon
                          >
                        </slide-y-down-transition>
                      </md-field>
                    </ValidationProvider>-->
                    <br />
                  </div>
                  <div
                    class="md-layout-item md-size-70 mt-4 md-small-size-100"
                    v-if="tagsList"
                  >
                    <vue-good-table
                      :columns="columns"
                      :rows="tagsList"
                      :select-options="{ enabled: true }"
                      :search-options="{ enabled: true }"
                      :group-options="{
                        enabled: true,
                        collapsable: true,
                      }"
                      @on-selected-rows-change="selectRoutes"
                    />
                  </div>
                  <div class="md-layout-item md-size-30 mt-4 md-small-size-100">
                    <div v-if="contextList">
                      <vue-good-table
                        :columns="columns2"
                        :rows="contextList"
                        :select-options="{ enabled: true }"
                        :search-options="{ enabled: true }"
                        :group-options="{
                          enabled: true,
                          collapsable: true,
                        }"
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
          </ValidationObserver>
        </md-card-content>
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
import { SpinalTwinServiceAppProfile } from "spinal-service-spinaltwin-admin";
import { APP_PROFILE_LIST_CONTEXT, API_LIST_CONTEXT } from "../../../constant";
import "vue-good-table/dist/vue-good-table.css";
import { VueGoodTable } from "vue-good-table";
export default {
  name: "AppProfile",
  components: { Pagination, SlideYDownTransition, Multiselect, VueGoodTable },
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
      profileData: {
        id: null,
        name: "",
        tagsList: [],
        contextList: [],
      },
      profiles: [],
      profileContext: null,
      digitalContextList: [],
      digitalGraph: SpinalGraph,
      sState: "",
      contextSelected: [],
      selectAll: false,
      selectAllRoutes: false,
      selectedRoutes: [],
      selected: [],
      contextList: [],
      configAccessAPI: {
        nameTag: null,
        rest: {
          GET: false,
          POST: false,
          PUT: false,
          DELETE: false,
        },
      },
      tagsList: [],
      fileSwagger: null,
      columns2: [
        {
          label: "Context",
          field: "name",
        },
      ],
      columns: [
        {
          label: "Routes",
          field: "name",
        },
        {
          label: "Scope",
          field: "scope",
        },
        {
          label: "Méthodes",
          field: "method",
        },
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
    digitalContextListComputed() {
      return this.digitalContextList.map((res) => {
        return {
          id: res.info.id?.get(),
          name: res.info.name?.get() ?? "no name",
          type: res.info.type?.get(),
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
      this.digitalGraph = await spinalIO.load(url);
      list = await this.digitalGraph.getChildren();
      for (i; i < list.length; i++) {
        this.digitalContextList.push(list[i]);
      }
      this.profileContext = SpinalGraphService.getContext(
        APP_PROFILE_LIST_CONTEXT
      );

      await this.getContextDigitalTwin();
      await this.getAppProfile();
      await this.getApis();
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
    selectRoutes(params) {
      this.selectedRoutes = [];
      this.profileData.tagsList = [];
      if (!this.selectAllRoutes) {
        for (let i in params.selectedRows) {
          let res = {
            name: params.selectedRows[i].name,
            method: params.selectedRows[i].method,
            scope: params.selectedRows[i].scope,
            id: params.selectedRows[i].id,
            originalIndex: params.selectedRows[i].originalIndex,
            vgtSelected: params.selectedRows[i].vgtSelected,
            vgt_id: params.selectedRows[i].vgt_id,
          };
          this.selectedRoutes.push(res);
        }
        this.profileData.tagsList = this.selectedRoutes;
      }
    },
    select(params) {
      this.selected = [];
      this.profileData.contextList = [];
      if (!this.selectAll) {
        let contx;
        for (let i in params.selectedRows) {
          contx = {
            id: params.selectedRows[i].id,
            data: params.selectedRows[i].name,
            type: params.selectedRows[i].type,
            originalIndex: params.selectedRows[i].originalIndex,
            vgtSelected: params.selectedRows[i].vgtSelected,
            vgt_id: params.selectedRows[i].vgt_id,
          };
          this.selected.push(contx);
        }
        this.profileData.contextList = this.selected;
      }
    },
    displayAdd(menu = "", item = null) {
      this.display = true;
      this.sState = menu;
      if (this.sState == "edit" && item != null) {
        this.profileData = item;
      }
      if (this.sState == "detail" && item != null) {
        this.profileData = item;
      }
      if (this.sState == "add") {
        this.profileData = {
          name: null,
          tagsList: [],
          contextList: [],
        };
      }
    },
    async getContextDigitalTwin() {
      let result = this.digitalContextListComputed.reduce(function (r, a) {
        r[a.type] = r[a.type] || [];
        r[a.type].push(a);
        return r;
      }, Object.create(null));

      for (var key in result) {
        let data = {
          name: key,
          children: result[key],
        };
        this.contextList.push(data);
      }
    },
    async getApis() {
      let apiContext = SpinalGraphService.getContext(API_LIST_CONTEXT);
      const api = await SpinalGraphService.getChildrenInContext(
        apiContext.info.id.get(),
        apiContext.info.id.get()
      );
      if (api.length > 0) {
        api.map((res) => {
          let data = {
            name: null,
            children: [],
          };
          data.name = res.name.get();
          res.childrenIds.map(async (elt) => {
            const node = await SpinalGraphService.getNodeAsync(elt);
            let rep = {
              id: node.id.get(),
              name: node.name?.get(),
              method: node.method?.get(),
              scope: node.scope?.get(),
              tag: node.tag?.get(),
            };
            data.children.push(rep);
          });
          this.tagsList.push(data);
        });
      }
    },
    async getAppProfile() {
      const prof = await SpinalGraphService.getChildrenInContext(
        this.profileContext.info.id.get(),
        this.profileContext.info.id.get()
      );
      if (prof.length > 0) {
        prof.map((res) => {
          let data = {
            id: null,
            name: null,
            tagsList: null,
            contextList: null,
          };
          data.id = res.id.get();
          data.name = res.name.get();
          if (res.tagsList.get()) {
            data.tagsList = res.tagsList.get().map((el) => {
              return {
                name: el.name,
                method: el.method,
                scope: el.scope,
              };
            });
          }
          if (res.contextList.get()) {
            data.contextList = res.contextList.get().map((el) => {
              return {
                id: el.id,
                name: el.name,
              };
            });
          }
          this.profiles.push(data);
        });
      }
    },

    async saveProfile() {
      const graphContext = new SpinalGraph("GraphContext");
      if (this.profileData.contextList.length > 0) {
        this.profileData.contextList.forEach(async (element) => {
          const contxNode = await this.digitalGraph.getContext(element.name);
          graphContext.addContext(contxNode);
        });
      }
      this.profiles = [];
      if (this.profileData.id) {
        const res = SpinalTwinServiceAppProfile.updateAppProfile(
          this.profileData,
          this.profileData.id,
          graphContext
        );
      } else {
        await SpinalTwinServiceAppProfile.createAppProfile(
          this.profileData,
          graphContext
        );
      }
      this.display = false;
      this.getAppProfile();
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
