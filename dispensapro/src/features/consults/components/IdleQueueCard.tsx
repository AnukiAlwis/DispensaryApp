import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Badge,
} from "@mui/material";
import { queueService } from "../../Queues/services/QueueService";
import { Queue } from "../../Queues/types";

interface IdleQueueCardProps {
  doctorId: string;
  onStartConsultation: (queue: Queue) => void;
  // onResumeConsultation disabled: doctor does not navigate away or refresh during a session.
}

export default function IdleQueueCard({
  doctorId,
  onStartConsultation,
  // onResumeConsultation disabled.
}: IdleQueueCardProps) {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueues = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await queueService.getAll(doctorId);
      setQueues(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, [doctorId]);

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
          <Button variant="outlined" onClick={fetchQueues} sx={{ mt: 2 }}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Resume card disabled: doctor is assumed to stay in the active session once started.
  // if (inProgressQueue) {
  //   return (
  //     <Card sx={{ mb: 3 }}>
  //       <CardContent sx={{ textAlign: "center", py: 4 }}>
  //         <Badge
  //           badgeContent={inProgressQueue.queueNumber}
  //           color="warning"
  //           sx={{ mb: 2 }}
  //         />
  //         <Typography variant="h5" gutterBottom>
  //           {inProgressQueue.patientName}
  //         </Typography>
  //         <Typography color="text.secondary" sx={{ mb: 3 }}>
  //           You have an active consultation in progress.
  //         </Typography>
  //         <Button
  //           variant="contained"
  //           size="large"
  //           onClick={() => onResumeConsultation(inProgressQueue)}
  //         >
  //           Resume Consultation
  //         </Button>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  if (!nextWaitingQueue) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No patients currently waiting in queue
          </Typography>
          <Button variant="outlined" onClick={fetchQueues} sx={{ mt: 2 }}>
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
          onClick={() => onStartConsultation(nextWaitingQueue)}
        >
          Start Consulting
        </Button>
      </CardContent>
    </Card>
  );
}
