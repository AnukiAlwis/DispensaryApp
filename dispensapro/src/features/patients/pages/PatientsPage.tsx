import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SectionCard from "../../../components/SectionCard";
import DataTable, { Column, CustomAction } from "../../../components/DataTable";
import DataTableToolbar from "../../../components/DataTableToolbar";
import DialogModal from "../../../components/DialogModal";
import PatientForm from "../components/PatientForm";
import PatientIdentityCell from "../../../components/PatientIdentityCell";
import StatusChip from "../../../components/StatusChip";
import PageHeader from "../../../components/PageHeader";
import { usePatients } from "../hooks/usePatients";
import { Patient } from "../types";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import VisitIcon from "@mui/icons-material/TransferWithinAStation";
import { useNavigate } from "react-router-dom";
import CreateVisitForm from "../../visits/components/CreateVisitForm";

export default function PatientsPage() {
  const loggedInUser = useSelector(
    (state: RootState) => state.user.userDetails
  );

  const { patients, loading, addPatient, editPatient, fetchPatients } =
    usePatients();

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [openVisitModal, setOpenVisitModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [search, setSearch] = useState("");

  const columns: Column[] = [
    {
      id: "patient",
      label: "Patient",
      sortable: true,
      render: (row: Patient) => (
        <PatientIdentityCell
          firstName={row.firstName}
          lastName={row.lastName}
          id={row.id}
        />
      ),
    },
    {
      id: "ageGender",
      label: "Age / Gender",
      sortable: false,
      render: (row: Patient) => (
        <Typography variant="body2" color="text.primary">
          {row.age ? `${row.age} ` : "—"}
          {row.gender ? ` / ${row.gender}` : ""}
        </Typography>
      ),
    },
    { id: "contact", label: "Contact", sortable: false },
    {
      id: "status",
      label: "Status",
      sortable: false,
      render: () => <StatusChip status="ACTIVE" />,
    },
  ];

  const filteredPatients = patients.filter((p) =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setOpen(true);
  };

  const handleViewVisit = (patient: Patient) => {
    navigate(
      `/visits?patientId=${patient.id}&patientName=${patient.firstName} ${patient.lastName}`
    );
  };

  const customActions: CustomAction[] = [
    {
      icon: VisitIcon,
      tooltip: "View Visits",
      onClick: handleViewVisit,
      color: "primary",
    },
  ];

  const handleSubmit = async (values: Omit<Patient, "id">) => {
    try {
      if (editingPatient) {
        await editPatient(editingPatient.id!, values);
      } else {
        await addPatient(values);
      }
      await fetchPatients();
      setOpen(false);
      setEditingPatient(null);
    } catch (err) {
      console.error("Error saving patient:", err);
    }
  };

  const handleClosePatientModal = () => {
    setOpen(false);
    setEditingPatient(null);
  };

  return (
    <Box>
      <PageHeader
        title="Patients"
        subtitle="Manage patient records, contact details and visit history."
        action={{
          label: "Add Patient",
          onClick: () => {
            setEditingPatient(null);
            setOpen(true);
          },
          icon: <AddIcon />,
        }}
      />

      <SectionCard>
        <DataTableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name or phone number..."
        />

        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={200}
          >
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            columns={columns}
            rows={filteredPatients}
            onEdit={handleEdit}
            customActions={customActions}
            emptyText="No patients found."
          />
        )}

        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Showing {filteredPatients.length} of {patients.length} patients
          </Typography>
        </Box>
      </SectionCard>

      {/* Modal for Add / Edit */}
      <DialogModal
        open={open}
        title={editingPatient ? "Edit Patient" : "Add Patient"}
        subtitle="Create a new patient profile for appointments, visits and billing."
        onClose={handleClosePatientModal}
        maxWidth="md"
        hideCancel
        hideSave
      >
        <PatientForm
          initialValues={editingPatient || {}}
          onSubmit={handleSubmit}
          onCancel={handleClosePatientModal}
          createdById={loggedInUser?.id}
          submitLabel={editingPatient ? "Save Changes" : "Save Patient"}
        />
      </DialogModal>

      {/* New Modal for Create Visit */}
      <DialogModal
        open={openVisitModal}
        title={`Create Visit for ${selectedPatient?.firstName} ${
          selectedPatient?.lastName || ""
        }`}
        onClose={() => {
          setOpenVisitModal(false);
          setSelectedPatient(null);
        }}
      >
        <CreateVisitForm
          patient={selectedPatient}
          onClose={() => setOpenVisitModal(false)}
        />
      </DialogModal>
    </Box>
  );
}
