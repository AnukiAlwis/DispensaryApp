import { Typography, Box, Stack } from "@mui/material";
import QueueBadge from "../../../components/QueueBadge";
import StatusChip from "../../../components/StatusChip";
import { Queue } from "../types";

interface QueueCardProps {
  queue: Queue;
}

export default function QueueCard({ queue }: QueueCardProps) {
  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      alignItems="center"
      gap={3}
      p={1}
    >
      <Stack spacing={1.5} flex={1} width="100%">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Patient Name
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {queue.patientName}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Doctor
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            Dr. {queue.doctorName}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Status
          </Typography>
          <StatusChip status={queue.status} />
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Queue Date
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {queue.queueDate}
          </Typography>
        </Box>
      </Stack>
      <QueueBadge queueNumber={queue.queueNumber} size="large" />
    </Box>
  );
}
