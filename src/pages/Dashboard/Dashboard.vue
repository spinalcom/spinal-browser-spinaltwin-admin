<template>
  <div class="md-layout">
    <div class="md-layout-item md-size-20 mt-4 md-small-size-100"></div>
    <div class="md-layout-item md-size-60 mt-4 md-small-size-100">
      <h1 class="text-center" style="font-weight: bold">BIENVENUE</h1>
      <br />
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-primary">
          <h4 class="title" v-if="display === false && changeDGT === true">
            Sélectionner un DigitalTwin
          </h4>
          <h4 class="title" v-if="display === true">
            Enregistrer votre DigitalTwin
          </h4>
          <md-button
            class="md-primary pull-right"
            v-if="display === false && changeDGT === true"
            @click="displayAdd"
            >Nouveau DigitalTwin</md-button
          >
        </md-card-header>
        <md-card-content>
          <div class="md-layout" v-if="changeDGT === false">
            <div class="md-layout-item md-size-10"></div>
            <div class="md-layout-item md-size-80">
              <h3 class="text-center">
                Digital Twin en cours :
                <label class="text-success"> {{ nameDigitalTwin }} </label>
              </h3>
              <br />
              <md-button @click="changeDigitalTwin" class="btn-next md-primary">
                Changer
              </md-button>
            </div>
            <div class="md-layout-item md-size-10"></div>
          </div>
          <form
            @submit.prevent="validate"
            v-if="display === false && changeDGT === true"
          >
            <div>
              <div class="md-layout">
                <div class="md-layout-item">
                  <br />
                  <multiselect
                    v-model="value"
                    :options="digitalList"
                    placeholder="Select one"
                    label="name"
                    track-by="name"
                  ></multiselect>
                  <br />
                  <md-card-actions>
                    <div>
                      <md-button
                        @click="loadDigitalTwin"
                        class="btn-next md-primary"
                      >
                        Valider
                      </md-button>
                    </div>
                  </md-card-actions>
                </div>
              </div>
            </div>
          </form>
          <form ref="form" @submit.prevent="validate" v-if="display === true">
            <div>
              <div class="md-layout">
                <div class="md-layout-item">
                  <md-field>
                    <label>Nom</label>
                    <md-input v-model="digitalTwinData.name" type="text">
                    </md-input>
                  </md-field>
                  <md-field>
                    <label>Url du DigitalTwin</label>
                    <md-input v-model="digitalTwinData.url" type="text">
                    </md-input>
                  </md-field>
                  <br />
                  <md-card-actions>
                    <div>
                      <md-button @click="cancelAdd" class="btn-next md-danger">
                        Annuler
                      </md-button>
                      <md-button
                        @click="saveDigitalTwin"
                        class="btn-next md-primary"
                      >
                        Enregistrer
                      </md-button>
                    </div>
                  </md-card-actions>
                </div>
              </div>
            </div>
          </form>
        </md-card-content>
      </md-card>
    </div>
    <div class="md-layout-item md-size-20 mt-4 md-small-size-100"></div>
  </div>
</template>

<script>
import Multiselect from "vue-multiselect";
import {
  DATA_LIST_CONTEXT,
  ADD_DIGITALTWIN,
  SPINALTWIN_ADMIN_SERVICE_APP_RELATION_TYPE_PTR_LST
} from "../../constant";
import { spinalIO } from "../../services/spinalIO";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { Model } from "spinal-core-connectorjs_type";
export default {
  name: "Dashboard",
  components: { Multiselect },
  data() {
    return {
      display: false,
      changeDGT: true,
      options: [],
      nameDigitalTwin: "",
      value: "",
      nameWithLang: "",
      graph: null,
      digitalGraph: null,
      digitalList: [],
      digitalTwinData: {
        name: "",
        url: ""
      },
      urlSpinalTwinAdmin: null,
      dataListContext: null
    };
  },
  beforeCreate: function() {
    if (this.$route.query.path) {
      const url = atob(this.$route.query.path);
      localStorage.setItem("urlSpinalTwinGraph", url);
      this.urlSpinalTwinAdmin = localStorage.getItem("urlSpinalTwinGraph");
      console.log(this.urlSpinalTwinAdmin);
    }
  },
  created: async function() {
    const graph = await spinalIO.load(
      localStorage.getItem("urlSpinalTwinGraph")
    );
    await SpinalGraphService.setGraph(graph);

    console.log(SpinalGraphService);
    this.dataListContext = SpinalGraphService.getContext(DATA_LIST_CONTEXT);
    console.log(this.dataListContext);
    this.getDigitalTwin();

    if (localStorage.getItem("nameDigitalTwinCurrent")) {
      this.nameDigitalTwin = localStorage.getItem("nameDigitalTwinCurrent");
      this.changeDGT = false;
    }
  },
  methods: {
    getDigitalTwin() {
      console.log(this.dataListContext);
      if (this.dataListContext) {
        const result = SpinalGraphService.getChildren(
          this.dataListContext.info.id.get()
        )
          .then(async res => {
            this.digitalList = res;
            console.log(this.digitalList);
          })
          .catch(e => {
            console.error(e);
            return Promise.reject(Error("Internal Server Error"));
          });

        return result;
      }
    },
    loadDigitalTwin() {
      localStorage.setItem("nameDigitalTwinCurrent", this.value.name.get());
      localStorage.setItem("digitalGraphURL", this.value.url.get());
      console.log(this.value.url.get());
    },
    displayAdd() {
      this.display = true;
    },
    changeDigitalTwin() {
      this.changeDGT = true;
    },
    cancelAdd() {
      this.display = false;
      this.$refs.form.reset();
    },
    saveDigitalTwin() {
      if (this.digitalTwinData.name && this.digitalTwinData.url) {
        const nodeId = SpinalGraphService.createNode(
          this.digitalTwinData,
          undefined
        );
        const result = SpinalGraphService.addChildInContext(
          this.dataListContext.info.id.get(),
          nodeId,
          this.dataListContext.info.id.get(),
          ADD_DIGITALTWIN,
          SPINALTWIN_ADMIN_SERVICE_APP_RELATION_TYPE_PTR_LST
        )
          .then(async res => {
            this.getDigitalTwin();
            this.display = false;
            return res;
          })
          .catch(e => {
            console.error(e);
            return Promise.reject(Error("Internal Server Error"));
          });
        return result;
      }
    }
  }
};
</script>
