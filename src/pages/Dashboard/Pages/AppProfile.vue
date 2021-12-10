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

              <md-table-cell md-label="Tags access" md-sort-by="tagsList">
                <label v-for="(tag, index) in item.tagsList">
                  <template v-if="index > 0">,</template>
                  {{ tag.data }}
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
                    <ValidationProvider
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
                    </ValidationProvider>
                    <br />
                  </div>
                  <div
                    class="md-layout-item md-size-50 mt-4 md-small-size-100"
                    v-if="tagsList"
                  >
                    <table class="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th style="font-size: 16px">Ontologies</th>
                          <th style="font-size: 16px; color: cornflowerblue">
                            GET
                          </th>
                          <th style="font-size: 16px; color: lawngreen">
                            POST
                          </th>
                          <th style="font-size: 16px; color: orange">PUT</th>
                          <th style="font-size: 16px; color: red">DELETE</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="i in tagsList">
                          <td>{{ i }}</td>

                          <td>
                            <label class="form-checkbox">
                              <input
                                type="checkbox"
                                :value="i"
                                @input="configAPI(i, 'GET')"
                              />
                              <i class="form-icon"></i>
                            </label>
                          </td>

                          <td>
                            <label class="form-checkbox">
                              <input
                                type="checkbox"
                                :value="i"
                                @input="configAPI(i, 'POST')"
                              />
                              <i class="form-icon"></i>
                            </label>
                          </td>

                          <td>
                            <label class="form-checkbox">
                              <input
                                type="checkbox"
                                :value="i"
                                @input="configAPI(i, 'PUT')"
                              />
                              <i class="form-icon"></i>
                            </label>
                          </td>

                          <td>
                            <label class="form-checkbox">
                              <input
                                type="checkbox"
                                :value="i"
                                @input="configAPI(i, 'DELETE')"
                              />
                              <i class="form-icon"></i>
                            </label>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="md-layout-item md-size-50 mt-4 md-small-size-100">
                    <table class="table table-striped table-hover">
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
                    </table>
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
  SpinalGraphService
} from "spinal-env-viewer-graph-service";
import { SpinalTwinServiceAppProfile } from "spinal-service-spinaltwin-admin";
import { APP_PROFILE_LIST_CONTEXT } from "../../../constant";
// import Places from 'vue-places'
export default {
  name: "AppProfile",
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
        total: 0
      },
      options: [],
      value: [],
      searchQuery: "",
      propsToSearch: ["name", "sigle"],
      searchedData: [],
      fuseSearch: null,
      rules: [
        value =>
          !value ||
          value.size < 2000000 ||
          "Avatar size should be less than 2 MB!"
      ],
      profileData: {
        id: null,
        name: "",
        tagsList: [],
        contextList: []
      },
      profiles: [],
      profileContext: null,
      digitalContextList: [],
      digitalGraph: SpinalGraph,
      sState: "",
      contextSelected: [],
      selectAll: false,
      configAccessAPI: {
        nameTag: null,
        rest: {
          GET: false,
          POST: false,
          PUT: false,
          DELETE: false
        }
      },
      tagsList: [],
      fileSwagger: null
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
      return this.digitalContextList.map(res => {
        return {
          id: res.info.id?.get(),
          name: res.info.name?.get() ?? "no name"
        };
      });
    }
  },
  created: async function() {
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
        APP_PROFILE_LIST_CONTEXT
      );
      console.log(this.profileContext);

      await this.getAppProfile();
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
    configAPI(item, rest = "") {
      let res = {
        nameTag: item,
        rest: {
          GET: false,
          POST: false,
          PUT: false,
          DELETE: false
        }
      };
      if (this.profileData.tagsList.length > 0) {
        var index = this.profileData.tagsList.findIndex(x => x.nameTag == item);
        if (index === -1) {
          if (rest === "GET") {
            res.rest.GET = true;
          } else if (rest === "POST") {
            res.rest.POST = true;
          } else if (rest === "PUT") {
            res.rest.PUT = true;
          } else if (rest === "DELETE") {
            res.rest.DELETE = true;
          }
          this.profileData.tagsList.push(res);
        } else {
          if (rest === "GET") {
            this.profileData.tagsList[index].rest.GET = true;
          } else if (rest === "POST") {
            this.profileData.tagsList[index].rest.POST = true;
          } else if (rest === "PUT") {
            this.profileData.tagsList[index].rest.PUT = true;
          } else if (rest === "DELETE") {
            this.profileData.tagsList[index].rest.DELETE = true;
          }
        }
      } else {
        if (rest === "GET") {
          res.rest.GET = true;
        } else if (rest === "POST") {
          res.rest.POST = true;
        } else if (rest === "PUT") {
          res.rest.PUT = true;
        } else if (rest === "DELETE") {
          res.rest.DELETE = true;
        }
        this.profileData.tagsList.push(res);
      }
    },
    select() {
      this.profileData.contextList = [];
      if (!this.selectAll) {
        for (let i in this.digitalContextListComputed) {
          this.profileData.contextList.push(
            this.digitalContextListComputed[i].id
          );
        }
      }
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
          tagsList: [],
          contextList: []
        };
      }
    },
    async getAppProfile() {
      const prof = await SpinalGraphService.getChildrenInContext(
        this.profileContext.info.id.get(),
        this.profileContext.info.id.get()
      );
      console.log(prof);
      if (prof.length > 0) {
        prof.map(res => {
          let data = {
            id: null,
            name: null,
            tagsList: null,
            contextList: null
          };
          data.id = res.id.get();
          data.name = res.name.get();
          if (res.tagsList.get()) {
            data.tagsList = res.tagsList.get().map(el => {
              return {
                data: el.nameTag,
                rest: el.rest
              };
            });
          }
          if (res.contextList.get()) {
            data.contextList = res.contextList.get().map(el => {
              return {
                id: el.id,
                name: el.name
              };
            });
          }
          this.profiles.push(data);
        });
      }
      console.log(this.profiles);
    },

    readFile(ev) {
      const file = ev.target.files[0];
      const reader = new FileReader();
      if (file.name.includes(".json")) {
        reader.onload = res => {
          this.fileSwagger = res.target.result;
          this.parseSwaggerJson(JSON.parse(this.fileSwagger));
        };
        reader.onerror = err => console.log(err);
        reader.readAsText(file);
      }
    },

    parseSwaggerJson(swagger) {
      console.log(swagger.paths);
      const paths = swagger.paths;
      let tags = [];
      for (var key in paths) {
        if (paths[key].get) {
          tags.push(paths[key].get.tags[0]);
        } else if (paths[key].post) {
          tags.push(paths[key].post.tags[0]);
        } else if (paths[key].put) {
          tags.push(paths[key].put.tags[0]);
        } else if (paths[key].delete) {
          tags.push(paths[key].delete.tags[0]);
        }
      }
      const p = new Set();
      tags.forEach(element => {
        p.add(element);
      });
      this.tagsList = Array.from(p);
    },
    async saveProfile() {
      console.log(this.profileData);
      const graphContext = new SpinalGraph("GraphContext");
      if (this.profileData.contextList.length > 0) {
        this.profileData.contextList.forEach(async element => {
          const contxNode = await this.digitalGraph.getContext(element.name);
          graphContext.addContext(contxNode);
        });
      }
      this.profiles = [];
      console.log(this.profileData);
      if (this.profileData.id) {
        const res = SpinalTwinServiceAppProfile.updateAppProfile(
          this.profileData,
          this.profileData.id,
          graphContext
        );
        console.log(res);
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
      reader.addEventListener("load", event => {
        this.user.picture_base64 = reader.result.toString();
      });
      reader.readAsDataURL(fileObject);
    }
  },
  mounted() {
    // Fuse search initialization.
    this.fuseSearch = new Fuse(this.profiles, {
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
      let result = this.profiles;
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
