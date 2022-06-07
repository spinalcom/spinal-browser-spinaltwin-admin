<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-primary">
          <div class="card-icon">
            <md-icon>group</md-icon>
          </div>
          <h4 class="title">Liste des organes</h4>
        </md-card-header>
        <md-card-content> </md-card-content>
      </md-card>
    </div>
  </div>
</template>
<script>
import { Pagination } from "../../../components";
import Fuse from "fuse.js";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { spinalIO } from "../../../services/spinalIO";
import "vue-good-table/dist/vue-good-table.css";
import { VueGoodTable } from "vue-good-table";
import { ORGAN_LIST_CONTEXT } from "../../../constant";
export default {
  name: "OrganList",
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
      organList: [],
      app: {
        name: "",
      },
      appContext: null,
      columns: [
        {
          label: "Applications",
          field: "name",
        },
        /*{
          label: "Description",
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
        : this.organList.length;
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
    //nom, key unique, type,
    async getOrgans() {
      this.appContext = SpinalGraphService.getContext(ORGAN_LIST_CONTEXT);
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
          this.organList.push(data);
        });
      }
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
