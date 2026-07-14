import { Box, Chip, Typography } from "@mui/material";
import { Queue } from "../../Queues/types";
import { Patient } from "../../patients/types";

interface ActivePatientHeaderProps {
  queue: Queue;
  patient: Patient;
  bookingDateTime?: string | null;
}

export default function ActivePatientHeader({
  queue,
  patient,
  bookingDateTime,
}: ActivePatientHeaderProps) {
  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        borderRadius: 2,
        backgroundColor: (theme) => theme.palette.primary.main,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          You are currently consulting: {patient.firstName} {patient.lastName}
        </Typography>
        <Typography variant="body1" sx={{ mt: 0.5, opacity: 0.9 }}>
          {patient.age ? `Age: ${patient.age}, ` : ""}
          Gender: {patient.gender || "N/A"}
          {bookingDateTime
            ? `, Booking Date Time: ${new Date(bookingDateTime).toLocaleString()}`
            : ", First Visit"}
        </Typography>
      </Box>
      <Chip
        label={`Queue #${queue.queueNumber}`}
        sx={{
          bgcolor: "white",
          color: (theme) => theme.palette.primary.main,
          fontWeight: 700,
          fontSize: "1.1rem",
          px: 1,
          py: 2.5,
          borderRadius: "50%",
        }}
      />
    </Box>
  );
}
