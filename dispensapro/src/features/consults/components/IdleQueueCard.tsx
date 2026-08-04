import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Badge,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Queue } from "../../Queues/types";

interface IdleQueueCardProps {
  doctorId: string;
  queues: Queue[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onStartConsultation: (queue: Queue) => void;
  // onResumeConsultation disabled: doctor does not navigate away or refresh during a session.
}

export default function IdleQueueCard({
  doctorId,
  queues,
  loading,
  error,
  onRefresh,
  onStartConsultation,
  // onResumeConsultation disabled.
}: IdleQueueCardProps) {
  // Resume disabled: no in-progress recovery needed under the no-navigation/refresh assumption.
  // const inProgressQueue = queues.find(
  //   (q) => q.status === "IN_PROGRESS" || q.status === "CALLED"
  // );
  const nextWaitingQueue = queues.find(
    (q) =>
      q.status === "CHECKED_IN_WAITING"
  );

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }} color="text.secondary">
            Loading queue...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="outlined" onClick={onRefresh} sx={{ mt: 2 }}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!nextWaitingQueue) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No patients currently waiting in queue
          </Typography>
          <Button variant="outlined" onClick={onRefresh} sx={{ mt: 2 }}>
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ textAlign: "center", py: 4 }}>
        <Badge
          badgeContent={nextWaitingQueue.queueNumber}
          color="primary"
          sx={{ mb: 2, fontSize: "1.5rem" }}
        />
        <Typography variant="h5" gutterBottom>
          {nextWaitingQueue.patientName}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Next patient in queue
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<PlayArrowIcon />}
          onClick={() => onStartConsultation(nextWaitingQueue)}
          sx={{
            px: 3,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 600,
            textTransform: "none",
            boxShadow: 2,
            "&:hover": {
              boxShadow: 4,
              transform: "translateY(-1px)",
            },
          }}
        >
          Start Consulting
        </Button>
      </CardContent>
    </Card>
  );
}
