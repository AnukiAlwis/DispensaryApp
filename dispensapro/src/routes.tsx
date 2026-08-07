import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../src/layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Feature pages
import PatientsPage from "../src/features/patients/pages/PatientsPage";
import VisitsPage from "../src/features/visits/pages/VisitsPage";
import ConsultsPage from "../src/features/consults/pages/ConsultsPage";
import MedicineManagementPage from "./features/pharmacy/pages/MedicineManagementPage";
import DistributorsPage from "./features/pharmacy/pages/DistributorsPage";
import SupplyManagementPage from "./features/pharmacy/pages/SupplyManagementPage";
import PrescriptionDispensingPage from "./features/dispensing/pages/PrescriptionDispensingPage";

// Auth pages
import LoginPage from "./pages/LoginPage";
import AccessDeniedPage from "./pages/AccessDeniedPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/access-denied",
    element: <AccessDeniedPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ), // Protected layout with sidebar + top summary
    children: [
      { index: true, element: <Navigate to="/patients" replace /> }, // default redirect
      { path: "patients", element: <ProtectedRoute requiredPermission="PATIENT_VIEW"><PatientsPage /></ProtectedRoute> },
      { path: "visits", element: <ProtectedRoute requiredPermission="VISIT_VIEW"><VisitsPage /></ProtectedRoute> },
      { path: "consults", element: <ProtectedRoute requiredPermission="CONSULT_VIEW"><ConsultsPage /></ProtectedRoute> },
      { path: "dispensing", element: <ProtectedRoute requiredPermission="PRESCRIPTION_VIEW"><PrescriptionDispensingPage /></ProtectedRoute> },

      { path: "pharmacy/medicine", element: <ProtectedRoute requiredPermission="PHARMACY_VIEW"><MedicineManagementPage /></ProtectedRoute> },
      { path: "pharmacy/distributors", element: <ProtectedRoute requiredPermission="PHARMACY_VIEW"><DistributorsPage /></ProtectedRoute> },
      { path: "pharmacy/supply", element: <ProtectedRoute requiredPermission="PHARMACY_VIEW"><SupplyManagementPage /></ProtectedRoute> },
    ],
  },
]);
