import {
  Box,
  Button,
  Typography,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import ElevatedCard from "../../../components/ElevatedCard";
import DataTable, { Column, CustomAction } from "../../../components/DataTable";
import DialogModal from "../../../components/DialogModal";
import PatientForm from "../components/PatientForm";
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
    { id: "firstName", label: "First Name", sortable: true },
    { id: "lastName", label: "Last Name", sortable: true },
    { id: "age", label: "Age", sortable: true },
    { id: "contact", label: "Contact", sortable: false },
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
      text: "Visits",
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

  return (
    <Box>
      {/* Header */}
      {/* ... (Header content remains the same) */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5">Patients</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditingPatient(null);
            setOpen(true);
          }}
        >
          Add Patient
        </Button>
      </Box>

      {/* Card with search + table */}
      <ElevatedCard>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <TextField
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>

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
          />
        )}
      </ElevatedCard>

      {/* Modal for Add / Edit */}
      <DialogModal
        open={open}
        title={editingPatient ? "Edit Patient" : "Add Patient"}
        onClose={() => {
          setOpen(false);
          setEditingPatient(null);
        }}
      >
        <PatientForm
          initialValues={editingPatient || {}}
          onSubmit={handleSubmit}
          createdById={loggedInUser?.id}
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
        {/* Placeholder for the Create Visit Form component */}
        <CreateVisitForm
          patient={selectedPatient}
          onClose={() => setOpenVisitModal(false)}
        />
      </DialogModal>
    </Box>
  );
}
