<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-primary">
          <div class="card-icon">
            <md-icon>group</md-icon>
          </div>
          <h4 class="title">Liste des applications</h4>
          <!--<h4 class="title" v-if="display === true">
            Ajouter un niveau d'accès
          </h4>
          <md-button class="md-primary pull-right" @click="displayAdd('add')"
            >Ajouter</md-button>-->
        </md-card-header>
        <md-card-content>
          <div
            class="md-layout-item md-size-90 mt-4 md-small-size-100"
            v-if="appList"
          >
            <vue-good-table
              :columns="columns"
              :rows="appList"
              :search-options="{ enabled: true }"
              :group-options="{
                enabled: true,
                collapsable: true,
              }"
            />
          </div>
          <!--<ValidationObserver ref="form" v-if="display === true">
            <form @submit.prevent="validate">
              <div>
                <div class="md-layout">
                  <div class="md-layout-item md-size-60 mt-4 md-small-size-100">
                    <ValidationProvider name="name">
                      <md-field>
                        <label>Libellé</label>
                        <md-input v-model="role.name" type="text"> </md-input>
                      </md-field>
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
                  <md-button @click="saveRole" class="btn-next md-primary">
                    Enregistrer
                  </md-button>
                </div>
              </md-card-actions>
            </form>
          </ValidationObserver> -->
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
import {
  ROLE_LIST_CONTEXT,
  SPINALTWIN_ADMIN_SERVICE_APP_RELATION_TYPE_PTR_LST,
  SPINALTWIN_DESCRIPTION_CONTEXT,
} from "../../../constant";
// import { SlideYDownTransition } from "vue2-transitions";
// import Places from 'vue-places'
export default {
  name: "AppList",
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
      select: null,
      appList: [],
      app: {
        name: "",
      },
      appContext: null,
      columns: [
        {
          label: "Applications",
          field: "name",
        },
        {
          label: "Context Type",
          field: "",
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
        : this.appList.length;
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
      await this.getApps();
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
        this.role = item;
      }
      if (menu == "add") {
        this.role = {
          name: null,
        };
      }
    },
    async getApps() {
      this.appContext = SpinalGraphService.getContext(
        SPINALTWIN_DESCRIPTION_CONTEXT
      );
      const app = await SpinalGraphService.getChildrenInContext(
        this.appContext.info.id.get(),
        this.appContext.info.id.get()
      );
      if (app.length > 0) {
        app.map((res) => {
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
            };
            data.children.push(rep);
          });
          this.appList.push(data);
        });
      }
    },
    /*async saveRole() {
      console.log(this.role.id.get());
      if (this.role.id.get()) {
        console.log(this.role.name);
        const res = SpinalTwinServiceRole.updateRole(
          this.role.name,
          this.role.id.get()
        );
        console.log(res);
      } else {
        if (this.role.name) {
          await SpinalTwinServiceRole.createRole(this.role);
        }
      }
      this.display = false;
      this.getRoles();
    },
    cancelAdd() {
      this.display = false;
      this.$refs.form.reset();
    },*/
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
