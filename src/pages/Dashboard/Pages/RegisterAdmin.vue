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
    <div class="md-layout-item md-size-60 mt-4 md-small-size-100">
      <md-card v-if="verifRegister"
               class="md-card-primary"
               style="background-color: rgb(71, 101, 129) !important">
        <md-card-content>
          <div style="text-align: center">
            <h3 class="text-white"
                style="font-weight: bold">
              La plateforme BOS config est déja enregistré sur la plateforme
              d'Administration
            </h3>
          </div>
          <br />
          <div>
            <h5 class="text-white">
              Url de la plateforme d'administration :
              <span class="text-success">{{ urlAdmin }}</span>
            </h5>

            <h5 class="text-white">
              Nom du Bos : <span class="text-success">{{ bosName }}</span>
            </h5>
            <h5 class="text-white">
              Token de la plateforme d'administration :
              <span class="text-success"
                    v-if="tokenAdmin.length > 8">{{
                tokenAdmin.substring(0, 8) + "..."
              }}</span>
            </h5>
          </div>
        </md-card-content>
      </md-card>
      <br />
      <md-card v-if="!verifRegister">
        <md-card-header class="md-card-header-icon md-card-header-primary">
          <div class="card-icon">
            <md-icon>autorenew</md-icon>
          </div>
          <h4 class="title">Register Bos Config to Admin App</h4>
        </md-card-header>
        <md-card-content>
          <div ref="form">
            <form @submit.prevent="validate">
              <div>
                <div class="md-layout">
                  <div class="md-layout-item md-size-60 mt-4 md-small-size-100">
                    <md-field>
                      <label>Nom</label>
                      <md-input type="text"
                                v-model="registerAdminData.name">
                      </md-input>
                    </md-field>
                    <md-field>
                      <label>URL d'administration</label>
                      <md-input type="text"
                                v-model="registerAdminData.urlAdmin">
                      </md-input>
                    </md-field>
                    <md-field>
                      <label>Clé d'enregistrement</label>
                      <md-input type="password"
                                v-model="registerAdminData.registerKey">
                      </md-input>
                    </md-field>
                  </div>
                </div>
              </div>
              <br />
              <md-card-actions>
                <div>
                  <md-button class="btn-next md-danger"> Annuler </md-button>
                  <md-button class="btn-next md-primary"
                             @click="registerBos">
                    Enregistrer
                  </md-button>
                </div>
              </md-card-actions>
            </form>
          </div>
        </md-card-content>
      </md-card>
      <md-card v-else>
        <md-card-header class="md-card-header-icon md-card-header-primary">
          <div class="card-icon">
            <md-icon>autorenew</md-icon>
          </div>
          <h4 class="title">
            Envoyer les données à la plateforme d'administration
          </h4>
        </md-card-header>
        <md-card-content>
          <br />
          <h4 class="text-center text-success">
            Pour synchroniser les données du BOS Config avec la plateforme
            d'administration cliquez sur le bouton ci-dessous
          </h4>
          <br />
          <div style="text-align: center">
            <md-button class="btn-next md-primary"
                       @click="sendDataToAdmin('other')">
              Envoyer
            </md-button>
          </div>
          <!--<ValidationObserver ref="form">
            <form @submit.prevent="validate">
              <div>
                <div class="md-layout">
                  <div class="md-layout-item md-size-60 mt-4 md-small-size-100">
                    <multiselect
                      v-model="credential.type"
                      :options="platformList"
                      placeholder="Selectionnez le type de plateforme"
                      label="type"
                      track-by="name"
                    ></multiselect>
                    <br />
                    <ValidationProvider name="name" v-slot="{ passed, failed }">
                      <md-field
                        :class="[
                          { 'md-error': failed },
                          { 'md-valid': passed },
                          { 'md-form-group': true },
                        ]"
                      >
                        <label>Nom de la plateforme</label>
                        <md-input v-model="credential.name" type="text">
                        </md-input>
                      </md-field>
                    </ValidationProvider>

                    <ValidationProvider
                      name="clientId"
                      v-slot="{ passed, failed }"
                    >
                      <md-field
                        :class="[
                          { 'md-error': failed },
                          { 'md-valid': passed },
                          { 'md-form-group': true },
                        ]"
                      >
                        <label>Identifiant de la plateforme Admin</label>
                        <md-input v-model="credential.clientId" type="text">
                        </md-input>
                        <md-button
                          class="md-icon-button md-white"
                          @click="generate(10, 'id')"
                        >
                          <md-icon>autorenew</md-icon>
                        </md-button>
                      </md-field>
                    </ValidationProvider>
                  </div>
                </div>
              </div>
              <br />
              <md-card-actions>
                <div>
                  <md-button class="btn-next md-danger"> Annuler </md-button>
                  <md-button
                    class="btn-next md-primary"
                    @click="sendDataToAdmin"
                  >
                    Enregistrer
                  </md-button>
                </div>
              </md-card-actions>
            </form>
          </ValidationObserver>-->
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
import Multiselect from "vue-multiselect";
import {
  CREDENTIAL_ADMIN_TO_BOS,
  CREDENTIAL_BOS_TO_ADMIN,
  REGISTER_ADMIN,
  URL_BOS_CONFIG,
  SPINALTWIN_ADMIN_SERVICE_APP_RELATION_TYPE_PTR_LST,
} from "../../../constant";
import axios from "axios";
import Swal from "sweetalert2";
export default {
  name: "Roles",
  components: { Pagination, Multiselect },
  props: {
    type: {
      type: String,
      default: "text",
    },
    size: {
      type: String,
      default: "32",
    },
    characters: {
      type: String,
      default: "a-z,A-Z,0-9",
    },
    placeholder: {
      type: String,
      default: "Password",
    },
    auto: [String, Boolean],
    value: "",
    urlAdmin: "",
    bosName: "",
    tokenAdmin: "",
  },
  data() {
    return {
      registerAdminData: {
        name: null,
        urlAdmin: null,
        registerKey: null,
      },
      verifRegister: false,
      credential: {
        clientId: null,
      },
      showPassword: false,
      platformList: [
        {
          name: "SPINALTWIN",
        },
        {
          name: "ADMIN APP SERVER",
        },
      ],
      password: this.value,
    };
  },
  mounted: function () {
    if (this.auto == "true" || this.auto == 1) {
      this.generate();
    }
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
      this.getInfoRegisterBos();
      let verifRegister = SpinalGraphService.getContext(REGISTER_ADMIN);

      if (verifRegister) {
        this.verifRegister = verifRegister.info?.isRegister?.get() || false;
      }
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

    registerBos() {
      if (
        this.registerAdminData.name &&
        this.registerAdminData.urlAdmin &&
        this.registerAdminData.registerKey
      ) {
        axios
          .post(`${URL_BOS_CONFIG}/registerBosToAdmin`, this.registerAdminData)
          .then(async (res) => {
            if (res) {
              await this.sendDataToAdmin("first");
              this.getInfoRegisterBos();
              this.verifRegister = true;
            }
          });
      } else {
        Swal.fire({
          title: "Champs manquants",
          text: "Veuillez renseigner tous les champs",
          type: "error",
          confirmButtonClass: "md-button md-danger",
          buttonsStyling: false,
        });
      }
    },

    getInfoRegisterBos() {
      let credentialBos = SpinalGraphService.getContext(
        CREDENTIAL_BOS_TO_ADMIN
      );
      let credentialAdmin = SpinalGraphService.getContext(
        CREDENTIAL_ADMIN_TO_BOS
      );

      this.tokenAdmin = credentialAdmin.info.tokenAdminBos?.get();
      this.urlAdmin = credentialBos.info.urlAdmin?.get();
      this.bosName = credentialBos.info.bosName?.get();
    },

    async sendDataToAdmin(step) {
      if (step === "first") {
        this.generate(25, "id");
        if (this.credential.clientId) {
          return axios
            .put(`${URL_BOS_CONFIG}/sendDataToAdmin`, this.credential)
            .then((res) => {
              if (res.status === 200) {
                this.verifRegister = true;
                return Swal.fire({
                  title: "Beau travail",
                  text: "Votre BOS a bien été enregistré",
                  type: "success",
                  confirmButtonClass: "md-button md-primary",
                  buttonsStyling: false,
                });
              }
            });
        }
      }
      if (step === "other") {
        console.log("here");
        axios.put(`${URL_BOS_CONFIG}/otherSendData`).then((res) => {
          if (res) {
            console.log(res);
            if (res.status === 200) {
              Swal.fire({
                title: "Beau travail",
                text: "Les profils ont été mis à jour avec succès",
                type: "success",
                confirmButtonClass: "md-button md-primary",
                buttonsStyling: false,
              });
            }
          }
        });
      }
    },

    // Credential

    generate(size, input) {
      let charactersArray = this.characters.split(",");
      let CharacterSet = "";
      let password = "";

      if (charactersArray.indexOf("a-z") >= 0) {
        CharacterSet += "abcdefghijklmnopqrstuvwxyz";
      }
      if (charactersArray.indexOf("A-Z") >= 0) {
        CharacterSet += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      }
      if (charactersArray.indexOf("0-9") >= 0) {
        CharacterSet += "0123456789";
      }
      if (charactersArray.indexOf("#") >= 0) {
        CharacterSet += "![]{}()%&*$#^<>~@|";
      }

      for (let i = 0; i < size; i++) {
        password += CharacterSet.charAt(
          Math.floor(Math.random() * CharacterSet.length)
        );
      }
      if (input === "id") {
        this.credential.clientId = password;
      } else {
        this.credential.clientSecret = password;
      }
    },
    toggleShow() {
      this.showPassword = !this.showPassword;
    },

    // End Credential
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
