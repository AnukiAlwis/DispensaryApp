import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ElevatedCard from "../../../components/ElevatedCard";
import DataTable, { Column, CustomAction } from "../../../components/DataTable";
import { useGetVisitsByPatientId } from "../hooks/useVisit";
import { useNavigate } from "react-router-dom";
import { Patient } from "../../patients/types";
import DialogModal from "../../../components/DialogModal";
import CreateVisitForm from "../components/CreateVisitForm";
import { usePatients } from "../../patients/hooks/usePatients";
import CheckInIcon from "@mui/icons-material/FrontHand";
import { useQueue } from "../../Queues/hooks/useQueue";
import QueueCard from "../../Queues/components/QueueCard";
import { Queue } from "../../Queues/types";

export default function VisitsPage() {
  const { queues, addQueue } = useQueue();
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
      // sort by createdAt descending (latest first)
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

  const handleCheckin = () => {
    console.log("Check-in action triggered");
  };

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

  const handleCreateVisit = () => {
    setOpenVisitModal(true);
  };

  const columns: Column[] = useMemo(
    () => [
      { id: "createdAt", label: "Created At", sortable: true },
      { id: "doctorName", label: "Doctor Name", sortable: true },
      { id: "status", label: "Status", sortable: true },
    ],
    []
  );

  const oldVisitsColumns: Column[] = useMemo(
    () => [
      { id: "visitTime", label: "Visited Date", sortable: true },
      { id: "doctorName", label: "Doctor Name", sortable: true },
      { id: "status", label: "Status", sortable: true },
    ],
    []
  );

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5">
          Visits -{" "}
          {selectedPatient?.firstName + " " + selectedPatient?.lastName}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            handleCreateVisit();
          }}
        >
          Add New Visit
        </Button>
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
      ) : error ? (
        <Typography color="error">
          Failed to load visits: {error.message}
        </Typography>
      ) : (
        <>
          {/* Today's Visits */}
          <ElevatedCard>
            <Typography variant="h6" mb={2}>
              Today’s Visits
            </Typography>
            {todayVisits.length === 0 ? (
              <Typography>No visits for today</Typography>
            ) : (
              <DataTable
                columns={columns}
                rows={todayVisits.map((v) => ({
                  ...v,
                  createdAt: formatDateTime(v.createdAt),
                }))}
              />
            )}
          </ElevatedCard>

          <Box mt={4} />

          {/* Old Visits */}
          <ElevatedCard>
            <Typography variant="h6" mb={2}>
              Old Visits
            </Typography>
            {oldVisits.length === 0 ? (
              <Typography>No old visits to display</Typography>
            ) : (
              <DataTable
                columns={oldVisitsColumns}
                rows={oldVisits.map((v) => ({
                  ...v,
                  visitTime: formatDateTime(v.visitTime),
                }))}
              />
            )}
          </ElevatedCard>
        </>
      )}

      <DialogModal
        open={openVisitModal}
        title={`Create Visit for ${selectedPatient?.firstName} ${
          selectedPatient?.lastName || ""
        }`}
        onClose={() => {
          setOpenVisitModal(false);
        }}
      >
        {/* Placeholder for the Create Visit Form component */}
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
          title={"Queue Number " + createdQueue.queueNumber + " Assigned"}
          onClose={() => setCreatedQueue(null)}
          cancelText="CLOSE"
        >
          <QueueCard queue={createdQueue} />
        </DialogModal>
      )}
    </Box>
  );
}
