import { Box, Typography, Button, Stack, Divider } from "@mui/material";
import StatusChip from "../../../components/StatusChip";
import QueueBadge from "../../../components/QueueBadge";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FrontHandIcon from "@mui/icons-material/FrontHand";

interface VisitSummaryCardProps {
  time: string;
  doctorName: string;
  status: string;
  queueNumber?: number;
  onOpenVisit?: () => void;
  onCheckIn?: () => void;
}

export default function VisitSummaryCard({
  time,
  doctorName,
  status,
  queueNumber,
  onOpenVisit,
  onCheckIn,
}: VisitSummaryCardProps) {
  const isCheckedIn = status !== "BOOKED";

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid #E5E9F0",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "stretch", md: "center" },
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" flex={1}>
        <Box minWidth={100}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>
            Time
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {time}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />
        <Box minWidth={140}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>
            Doctor
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {doctorName}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />
        <Box minWidth={100}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>
            Status
          </Typography>
          <StatusChip status={status} />
        </Box>
      </Stack>

      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        justifyContent={{ xs: "flex-start", md: "flex-end" }}
        flexWrap="wrap"
      >
        {queueNumber !== undefined && <QueueBadge queueNumber={queueNumber} size="small" />}
        {onCheckIn && !isCheckedIn && (
          <Button variant="outlined" size="small" startIcon={<FrontHandIcon />} onClick={onCheckIn}>
            Check-In Now
          </Button>
        )}
        {onOpenVisit && (
          <Button variant="contained" size="small" startIcon={<OpenInNewIcon />} onClick={onOpenVisit}>
            Open Visit
          </Button>
        )}
      </Stack>
    </Box>
  );
}
