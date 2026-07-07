import { Typography, Box } from "@mui/material";
import ElevatedCard from "../../../components/ElevatedCard";
import { Queue } from "../types";

interface QueueCardProps {
  queue: Queue;
}

export default function QueueCard({ queue }: QueueCardProps) {
  return (
    <ElevatedCard>
      <Box display="flex" flexDirection="row" gap={3} p={2} alignItems="center">
        <Box display="flex" flexDirection="column" gap={2} flex={1}>
          <Typography variant="body1">
            <strong>Patient Name :</strong> {queue.patientName}
          </Typography>
          <Typography variant="body1">
            <strong>Doctor Name :</strong> {queue.doctorName}
          </Typography>
          <Typography variant="body1">
            <strong>Status :</strong> {queue.status}
          </Typography>
        </Box>
        <Box
          width={120}
          height={120}
          bgcolor="warning.main"
          borderRadius={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h5" color="white" align="center">
            Queue Number
          </Typography>
          <Typography variant="h4" color="white" align="center" fontWeight="bold">
            {queue.queueNumber}
          </Typography>
        </Box>
      </Box>
    </ElevatedCard>
  );
}
