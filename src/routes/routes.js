import DashboardLayout from "../pages/Dashboard/Layout/DashboardLayout.vue";

// Dashboard pages
import Dashboard from "../pages/Dashboard/Dashboard.vue";

import Profiles from "../pages/Dashboard/Pages/Profiles.vue";
import Users from "../pages/Dashboard/Pages/Users.vue";
import Roles from "../pages/Dashboard/Pages/Roles.vue";

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
        path: "roles",
        name: "Rôles",
        components: { default: Roles }
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
