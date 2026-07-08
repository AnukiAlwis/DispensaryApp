import { Box, Typography, CircularProgress, Button, Stack, Chip } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SectionCard from "../../../components/SectionCard";
import DataTable, { Column } from "../../../components/DataTable";
import { useGetVisitsByPatientId } from "../hooks/useVisit";
import { useNavigate } from "react-router-dom";
import DialogModal from "../../../components/DialogModal";
import CreateVisitForm from "../components/CreateVisitForm";
import { usePatients } from "../../patients/hooks/usePatients";
import CheckInIcon from "@mui/icons-material/FrontHand";
import AddIcon from "@mui/icons-material/Add";
import PatientIdentityCell from "../../../components/PatientIdentityCell";
import StatusChip from "../../../components/StatusChip";
import VisitSummaryCard from "../components/VisitSummaryCard";
import QueueCard from "../../Queues/components/QueueCard";
import { Queue } from "../../Queues/types";

export default function VisitsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId") || "";

  const { visits, loading, error, fetchVisits } = useGetVisitsByPatientId();
  const { selectedPatient, fetchPatientById } = usePatients();
  const [todayVisits, setTodayVisits] = useState<any[]>([]);
  const [oldVisits, setOldVisits] = useState<any[]>([]);

  const [openVisitModal, setOpenVisitModal] = useState(false);
  const [createdQueue, setCreatedQueue] = useState<Queue | null>(null);

  useEffect(() => {
    if (patientId) {
      fetchVisits(patientId);
      fetchPatientById(patientId);
    }
  }, [patientId, openVisitModal]);

  useEffect(() => {
    if (visits.length > 0) {
      const sortedVisits = [...visits].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const today = new Date();
      const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const todays = sortedVisits.filter((v) => {
        const createdAt = new Date(v.createdAt);
        return (
          createdAt >= startOfToday &&
          createdAt < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
        );
      });

      const old = sortedVisits.filter((v) => {
        const createdAt = new Date(v.createdAt);
        return createdAt < startOfToday;
      });

      setTodayVisits(todays);
      setOldVisits(old);
    } else {
      setTodayVisits([]);
      setOldVisits([]);
    }
  }, [visits]);

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(
      2,
      "0"
    )}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const handleCreateVisit = () => {
    setOpenVisitModal(true);
  };

  const oldVisitsColumns: Column[] = useMemo(
    () => [
      {
        id: "visitDate",
        label: "Visited Date",
        sortable: true,
        render: (row: any) => (
          <Typography variant="body2" fontWeight={600}>
            {formatDate(row.visitTime || row.createdAt)}
          </Typography>
        ),
      },
      {
        id: "doctorName",
        label: "Doctor",
        sortable: true,
      },
      {
        id: "status",
        label: "Status",
        sortable: true,
        render: (row: any) => <StatusChip status={row.status} />,
      },
    ],
    []
  );

  const patientFullName = `${selectedPatient?.firstName || ""} ${
    selectedPatient?.lastName || ""
  }`.trim();

  return (
    <Box>
      {/* Patient Header Summary */}
      <SectionCard>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          flexDirection={{ xs: "column", md: "row" }}
          gap={2}
        >
          <Box>
            <PatientIdentityCell
              firstName={selectedPatient?.firstName}
              lastName={selectedPatient?.lastName}
              id={selectedPatient?.id}
              size="large"
            />
            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
              {selectedPatient?.age && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${selectedPatient.age} yrs`}
                />
              )}
              {selectedPatient?.gender && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={selectedPatient.gender}
                />
              )}
              {selectedPatient?.contact && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={selectedPatient.contact}
                />
              )}
              <StatusChip status="ACTIVE" />
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<CheckInIcon />}
              onClick={() => navigate("/", { state: { openCheckIn: true } })}
            >
              Check-In
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateVisit}
            >
              Add Visit
            </Button>
          </Stack>
        </Box>
      </SectionCard>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={200}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">
          Failed to load visits: {error.message}
        </Typography>
      ) : (
        <>
          {/* Today's Visits */}
          <SectionCard title="Today's Visit">
            {todayVisits.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No visits scheduled for today.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {todayVisits.map((v) => (
                  <VisitSummaryCard
                    key={v.id}
                    time={formatDateTime(v.createdAt)}
                    doctorName={v.doctorName || "Unassigned"}
                    status={v.status}
                    onOpenVisit={() => console.log("Open visit", v.id)}
                  />
                ))}
              </Stack>
            )}
          </SectionCard>

          {/* Old Visits */}
          <SectionCard title="Visit History">
            {oldVisits.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No previous visits to display.
              </Typography>
            ) : (
              <DataTable
                columns={oldVisitsColumns}
                rows={oldVisits.map((v) => ({
                  ...v,
                  visitDate: formatDate(v.visitTime || v.createdAt),
                }))}
                emptyText="No old visits to display."
              />
            )}
          </SectionCard>
        </>
      )}

      <DialogModal
        open={openVisitModal}
        title={`Create Visit${patientFullName ? ` for ${patientFullName}` : ""}`}
        subtitle="Schedule a new visit for this patient and assign a queue number."
        onClose={() => setOpenVisitModal(false)}
        maxWidth="sm"
        hideCancel
        hideSave
      >
        <CreateVisitForm
          patient={selectedPatient}
          onClose={(queue) => {
            setOpenVisitModal(false);
            setCreatedQueue(queue || null);
          }}
        />
      </DialogModal>

      {createdQueue && (
        <DialogModal
          open={!!createdQueue}
          title={`Queue Number ${createdQueue.queueNumber} Assigned`}
          subtitle="The patient has been added to the queue successfully."
          onClose={() => setCreatedQueue(null)}
          cancelText="Close"
          maxWidth="sm"
        >
          <QueueCard queue={createdQueue} />
        </DialogModal>
      )}
    </Box>
  );
}
