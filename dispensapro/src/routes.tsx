import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../src/layouts/AppLayout";

// Feature pages
import PatientsPage from "../src/features/patients/pages/PatientsPage";
import VisitsPage from "../src/features/visits/pages/VisitsPage";
import ConsultsPage from "../src/features/consults/pages/ConsultsPage";
import MedicineManagementPage from "./features/pharmacy/pages/MedicineManagementPage";
import DistributorsPage from "./features/pharmacy/pages/DistributorsPage";
import SupplyManagementPage from "./features/pharmacy/pages/SupplyManagementPage";

// Future: add standalone public routes (login, landing, etc.)

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />, // Protected layout with sidebar + top summary
    children: [
      { index: true, element: <Navigate to="/patients" replace /> }, // default redirect
      { path: "patients", element: <PatientsPage /> },
      { path: "visits", element: <VisitsPage /> },
      { path: "consults", element: <ConsultsPage /> },

      { path: "pharmacy/medicine", element: <MedicineManagementPage /> },
      { path: "pharmacy/distributors", element: <DistributorsPage /> },
      { path: "pharmacy/supply", element: <SupplyManagementPage /> },
    ],
  },
]);
