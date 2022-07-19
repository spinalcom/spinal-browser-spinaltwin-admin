<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-primary">
          <div class="card-icon">
            <md-icon>group</md-icon>
          </div>
          <h4 class="title" v-if="display === false">Liste des API</h4>
          <h4 class="title" v-if="display === true">Modifier les API</h4>
          <md-button
            v-if="display === false"
            class="md-primary pull-right"
            @click="displayAdd('add')"
            >Editer les API</md-button
          >
        </md-card-header>
        <md-card-content>
          <div
            v-if="display === false"
            class="md-layout-item md-size-90 mt-4 md-small-size-100"
          >
            <vue-good-table
              v-if="apiList"
              :columns="columns"
              :rows="apiList"
              :search-options="{ enabled: true }"
              :group-options="{
                enabled: true,
                collapsable: true,
              }"
            />
          </div>

          <div ref="form" v-if="display === true">
            <form>
              <div>
                <div class="md-layout">
                  <div class="md-layout-item md-size-60 mt-4 md-small-size-100">
                    
                      <md-field
                      >
                        <md-input @change="readFile" type="file"> </md-input>

                      </md-field>
                  </div>
                  <div
                    class="md-layout-item md-size-70 mt-4 md-small-size-100"
                    v-if="tagsList"
                  >
                    <vue-good-table
                      :columns="columns"
                      :rows="tagsList"
                      :search-options="{ enabled: true }"
                      :group-options="{
                        enabled: true,
                        collapsable: true,
                      }"
                    />
                  </div>
                </div>
              </div>
              <br />
              <md-card-actions>
                <div>
                  <md-button @click="cancelAdd" class="btn-next md-danger">
                    Annuler
                  </md-button>
                  <md-button @click="saveApi" class="btn-next md-primary">
                    Enregistrer
                  </md-button>
                </div>
              </md-card-actions>
            </form>
          </div>
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
import "vue-good-table/dist/vue-good-table.css";
import { VueGoodTable } from "vue-good-table";
import Swal from "sweetalert2";
import {
  API_LIST_CONTEXT,
  HAS_API_IN_GROUP_RELATION,
  HAS_API_IN_CONTEXT_RELATION,
} from "../../../constant";
// import { SlideYDownTransition } from "vue2-transitions";
// import Places from 'vue-places'
export default {
  name: "ApiList",
  components: { Pagination, VueGoodTable },
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
        total: 0,
      },
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
      apiList: [],
      apiContext: null,
      tagsList: [],
      fileSwagger: null,
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
        : this.apiList.length;
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
    displayAdd(menu = "", item = null) {
      this.display = true;
      if (menu == "edit" && item != null) {
        this.api = item;
      }
      if (menu == "add") {
        this.api = {
          name: null,
        };
      }
    },
    async getApis() {
      this.apiList = [];
      this.apiContext = SpinalGraphService.getContext(API_LIST_CONTEXT);
      let api = await SpinalGraphService.getChildren(
        this.apiContext.info.id.get()
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
              name: node.name.get(),
              method: node.method?.get(),
              scope: node.scope?.get(),
              tag: node.tag?.get(),
            };
            data.children.push(rep);
          });
          this.apiList.push(data);
        });
      }
    },
    readFile(ev) {
      const file = ev.target.files[0];
      if (file.name.includes(".json")) {
        const reader = new FileReader();
        reader.onload = (res) => {
          this.fileSwagger = res.target.result;
          this.parseSwaggerJson(JSON.parse(this.fileSwagger));
        };
        reader.readAsText(file);
      }
    },

    parseSwaggerJson(swagger) {
      console.log("Parseeeee");
      const paths = swagger.paths;
      let datas = [];
      for (var key in paths) {
        let item = {
          name: key,
          method: null,
          tag: null,
          scope: null,
        };
        if (paths[key].get) {
          item.method = "GET";
          item.tag = paths[key].get.tags[0];
          if (paths[key].get.security) {
            item.scope = paths[key].get.security[0].OauthSecurity[0];
          }
        } else if (paths[key].post) {
          item.method = "POST";
          item.tag = paths[key].post.tags[0];
          if (paths[key].post.security) {
            item.scope = paths[key].post.security[0].OauthSecurity[0];
          }
        } else if (paths[key].put) {
          item.method = "PUT";
          item.tag = paths[key].put.tags[0];
          if (paths[key].put.security) {
            item.scope = paths[key].put.security[0].OauthSecurity[0];
          }
        } else if (paths[key].delete) {
          item.method = "DELETE";
          item.tag = paths[key].delete.tags[0];
          if (paths[key].delete.security) {
            item.scope = paths[key].delete.security[0].OauthSecurity[0];
          }
        }

        datas.push(item);
      }
      const groups = datas.reduce((groups, item) => {
        const group = groups[item.tag] || [];
        group.push(item);
        groups[item.tag] = group;
        return groups;
      }, {});
      let data;
      for (var key in groups) {
        data = {
          name: key,
          children: groups[key],
        };
        console.log(data)
        this.tagsList.push(data);
      }
    },

    async saveApi() {
      let allChildren = await SpinalGraphService.getChildrenInContext(
        this.apiContext.info.id.get(),
        this.apiContext.info.id.get()
      );
      if (allChildren.length > 0) {
        await Promise.all(
          allChildren.map(async (elt) => {
            await SpinalGraphService.removeFromGraph(elt.id.get());
          })
        );
      }
      if (this.tagsList) {
        this.tagsList.forEach(async (element) => {
          if (element.name) {
            let grpName = { name: element.name };
            let group = SpinalGraphService.createNode(
              grpName,
              SpinalGraphService.getGraph()
            );
            await SpinalGraphService.addChildInContext(
              this.apiContext.info.id.get(),
              group,
              this.apiContext.info.id.get(),
              HAS_API_IN_CONTEXT_RELATION,
              "PtrLst"
            );
            if (element.children.length > 0) {
              element.children.map(async (resp) => {
                let api = SpinalGraphService.createNode(
                  resp,
                  SpinalGraphService.getGraph()
                );
                await SpinalGraphService.addChildInContext(
                  group,
                  api,
                  this.apiContext.info.id.get(),
                  HAS_API_IN_GROUP_RELATION,
                  "PtrLst"
                );
              });
            }
          }
        });
      }
      Swal.fire({
        title: "Beau travail",
        text: "Les routes d'API ont été enregistré avec succès",
        type: "success",
        confirmButtonClass: "md-button md-primary",
        buttonsStyling: false
      });
      await this.getApis();
      this.display = false;
    },
    cancelAdd() {
      this.display = false;
      this.tagsList = [];
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
