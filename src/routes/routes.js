import DashboardLayout from "../pages/Dashboard/Layout/DashboardLayout.vue";

// Dashboard pages
import Dashboard from "../pages/Dashboard/Dashboard.vue";

import Profiles from "../pages/Dashboard/Pages/Profiles.vue";
import AppProfile from "../pages/Dashboard/Pages/AppProfile.vue";
import Users from "../pages/Dashboard/Pages/Users.vue";
import AppList from "../pages/Dashboard/Pages/AppList.vue";
import ApiList from "../pages/Dashboard/Pages/ApiList.vue";
import OrganList from "../pages/Dashboard/Pages/OrganList.vue";
import Credentials from "../pages/Dashboard/Pages/Credentials.vue";
import RegisterAdmin from "../pages/Dashboard/Pages/RegisterAdmin.vue";

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
    name: "Home"
  },
  {
    path: "/",
    component: DashboardLayout,
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        components: { default: Dashboard }
      },
      {
        path: "profiles",
        name: "Profiles",
        components: { default: Profiles }
      },
      {
        path: "appProfile",
        name: "AppProfile",
        components: { default: AppProfile }
      },
      {
        path: "app-list",
        name: "AppList",
        components: { default: AppList }
      },
      {
        path: "api-list",
        name: "ApiList",
        components: { default: ApiList }
      },
      {
        path: "organ-list",
        name: "OrganList",
        components: { default: OrganList }
      },
      {
        path: "credentials",
        name: "Credentials",
        components: { default: Credentials }
      },
      {
        path: "registerAppServer",
        name: "RegisterAdmin",
        components: { default: RegisterAdmin }
      },
      {
        path: "users",
        name: "Utilisateurs",
        components: { default: Users }
      }
    ]
  }
];

export default routes;
