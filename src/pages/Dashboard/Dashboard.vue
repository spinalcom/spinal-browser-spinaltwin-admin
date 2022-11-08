<!--
Copyright 2022 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
  <div class="md-layout">
    <div class="md-layout-item md-size-20 mt-4 md-small-size-100"></div>
    <div class="md-layout-item md-size-60 mt-4 md-small-size-100">
      <h1 class="text-center"
          style="font-weight: bold">BIENVENUE</h1>
      <br />
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-primary">
          <h4 class="title"
              v-if="display === false && changeDGT === true">
            Sélectionner un DigitalTwin
          </h4>
          <h4 class="title"
              v-if="display === true">
            Enregistrer votre DigitalTwin
          </h4>
          <md-button class="md-primary pull-right"
                     v-if="display === false && changeDGT === true"
                     @click="displayAdd">Nouveau DigitalTwin</md-button>
        </md-card-header>
        <md-card-content>
          <div class="md-layout"
               v-if="changeDGT === false">
            <div class="md-layout-item md-size-10"></div>
            <div class="md-layout-item md-size-80">
              <h3 class="text-center">
                Digital Twin en cours :
                <label class="text-success"> {{ nameDigitalTwin }} </label>
              </h3>
              <br />
              <md-button @click="changeDigitalTwin"
                         class="btn-next md-primary">
                Changer
              </md-button>
            </div>
            <div class="md-layout-item md-size-10"></div>
          </div>
          <form @submit.prevent="validate"
                v-if="display === false && changeDGT === true">
            <div>
              <div class="md-layout">
                <div class="md-layout-item">
                  <br />
                  <multiselect v-model="value"
                               :options="digitalList"
                               placeholder="Select one"
                               label="name"
                               track-by="name"></multiselect>
                  <br />
                  <md-card-actions>
                    <div>
                      <md-button @click="loadDigitalTwin"
                                 class="btn-next md-primary">
                        Valider
                      </md-button>
                    </div>
                  </md-card-actions>
                </div>
              </div>
            </div>
          </form>
          <form ref="form"
                @submit.prevent="validate"
                v-if="display === true">
            <div>
              <div class="md-layout">
                <div class="md-layout-item">
                  <md-field>
                    <label>Nom</label>
                    <md-input v-model="digitalTwinData.name"
                              type="text">
                    </md-input>
                  </md-field>
                  <md-field>
                    <label>Url du DigitalTwin</label>
                    <md-input v-model="digitalTwinData.url"
                              type="text">
                    </md-input>
                  </md-field>
                  <br />
                  <md-card-actions>
                    <div>
                      <md-button @click="cancelAdd"
                                 class="btn-next md-danger">
                        Annuler
                      </md-button>
                      <md-button @click="saveDigitalTwin"
                                 class="btn-next md-primary">
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
  HUB_USER,
  URL_BOS_CONFIG,
  SPINALTWIN_ADMIN_SERVICE_APP_RELATION_TYPE_PTR_LST,
} from "../../constant";
import axios from "axios";
import { spinalIO } from "../../services/spinalIO";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import {
  Model,
  spinalCore,
  SpinalUserManager,
} from "spinal-core-connectorjs_type";
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
        url: "",
      },
      urlSpinalTwinAdmin: null,
      dataListContext: null,
    };
  },
  beforeCreate: function () {
    if (this.$route.query.path) {
      const url = atob(this.$route.query.path);
      localStorage.setItem("urlSpinalTwinGraph", url);
      this.urlSpinalTwinAdmin = localStorage.getItem("urlSpinalTwinGraph");
    }
  },
  created: async function () {
    const graph = await spinalIO.load(
      localStorage.getItem("urlSpinalTwinGraph")
    );
    await SpinalGraphService.setGraph(graph);
    this.dataListContext = SpinalGraphService.getContext(DATA_LIST_CONTEXT);
    this.getDigitalTwin();
  },
  methods: {
    async getDigitalTwin() {
      if (this.dataListContext) {
        const children = await this.dataListContext.getChildren();

        this.digitalList = children.map((rep) => {
          return {
            id: rep.info.id?.get(),
            name: rep.info.name?.get() ?? "no name",
            url: rep.info.url?.get(),
          };
        });

        if (this.digitalList.length < 1) {
          localStorage.removeItem("nameDigitalTwinCurrent");
        } else if (localStorage.getItem("nameDigitalTwinCurrent")) {
          this.nameDigitalTwin = localStorage.getItem("nameDigitalTwinCurrent");
          this.changeDGT = false;
          // await this.createUserHub();
        }
      }

      // return result;
    },
    async loadDigitalTwin() {
      localStorage.setItem("nameDigitalTwinCurrent", this.value.name);
      this.nameDigitalTwin = localStorage.getItem("nameDigitalTwinCurrent");
      localStorage.setItem("digitalGraphURL", this.value.url);
      this.changeDGT = false;
      // await this.createUserHub();
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
    async createUserHub() {
      let context = SpinalGraphService.getContext(HUB_USER);

      const flag_readOnly = spinalCore.right_flag.RD;
      const flag_WriteRead =
        spinalCore.right_flag.WR | spinalCore.right_flag.RD;

      let graph = await spinalIO.load(localStorage.getItem("digitalGraphURL"));

      let adminUser = { name: "SpinalAdmin", password: "" };
      let integrateurUser = { name: "Integrateur", password: "" };
      let basicUser = { name: "Basic User", password: "" };
      let userArray = [adminUser, integrateurUser, basicUser];

      userArray.forEach(async (element) => {
        let node;

        let result = axios
          .post(`/checkHubUserExist`, {
            username: element.name,
          })
          .then((response) => {
            console.log(response);
            if (response.data.exist === false) {
              const nodeId = SpinalGraphService.createNode(element, undefined);
              const result = SpinalGraphService.addChildInContext(
                context.info.id.get(),
                nodeId,
                context.info.id.get(),
                "HubUserListHasUser",
                SPINALTWIN_ADMIN_SERVICE_APP_RELATION_TYPE_PTR_LST
              );
              SpinalUserManager.new_account(
                URL_BOS_CONFIG,
                element.name,
                element.password
              );
              if (element.name === "SpinalAdmin") {
                spinalIO.sharedModel(
                  graph._server_id,
                  flag_WriteRead,
                  element.name
                );
              }
              if (element.name === "Integrateur") {
                spinalIO.share_model(
                  graph._server_id,
                  flag_WriteRead,
                  element.name
                );
              }
              if (element.name === "Basic Utilisateur") {
                spinalIO.share_model(
                  graph._server_id,
                  flag_WriteRead,
                  element.name
                );
              }
            }
          });
      });

      console.log(await spinalIO.load("/etc/UserProfileDir"));
    },
    saveDigitalTwin() {
      if (this.digitalTwinData.name && this.digitalTwinData.url) {
        axios
          .post(`${URL_BOS_CONFIG}/saveDigitalTwin`, this.digitalTwinData)
          .then(async (res) => {
            if (res.status === 200) {
              this.digitalList = [...this.digitalList, res.data];
              // await this.getDigitalTwin();
              this.display = false;
            }
          })
          .catch((e) => {
            console.error(e);
            return Promise.reject(Error("Internal Server Error"));
          });

        /*const nodeId = SpinalGraphService.createNode(
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
          .then(async (res) => {
            this.getDigitalTwin();
            this.display = false;
            return res;
          })
          .catch((e) => {
            console.error(e);
            return Promise.reject(Error("Internal Server Error"));
          });
        
        return result;*/
      }
    },
  },
};
</script>
