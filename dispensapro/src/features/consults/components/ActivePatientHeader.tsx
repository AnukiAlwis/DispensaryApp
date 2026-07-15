import { Box, Chip, Typography, Avatar } from "@mui/material";
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
        px: 3,
        py: 2.5,
        borderRadius: 2,
        backgroundColor: (theme) => theme.palette.primary.main,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        boxShadow: 2,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "white",
              color: (theme) => theme.palette.primary.dark,
              width: 40,
              height: 40,
              fontWeight: 600,
              fontSize: "0.9rem",
              flexShrink: 0,
            }}
          >
            {`${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`.toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color:"white"
              }}
            >
              You are currently consulting  :   {patient.firstName} {patient.lastName}
            </Typography>
            <Typography 
              variant="h6" 
              component="div"
              sx={{ 
                fontWeight: 600, 
                fontSize: "1.05rem",
                lineHeight: 1.3,
                mb: 0.25,
              }}
            >
              
            </Typography>
            <Typography 
              variant="caption" 
              component="div"
              sx={{ 
                opacity: 0.85,
                fontSize: "0.75rem",
                lineHeight: 1.3,
              }}
            >
              {patient.age ? `Age: ${patient.age}` : "Age: N/A"}	
              {patient.gender && ` |  Gender: ${patient.gender}`}	
              {bookingDateTime && ` |  Booking: ${new Date(bookingDateTime).toLocaleString()}`}	
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
        <Chip
          label={`Queue #${queue.queueNumber}`}
          sx={{
            bgcolor: "white",
            color: (theme) => theme.palette.primary.dark,
            fontWeight: 600,
            fontSize: "0.75rem",
            px: 1.5,
            py: 0.25,
            height: "auto",
            borderRadius: "12px",
            boxShadow: "none",
            textAlign: "center",
          }}
        />
        <Typography 
          variant="caption" 
          sx={{ 
            opacity: 0.8,
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            fontWeight: 500,
          }}
        >
          Current Queue
        </Typography>
      </Box>
    </Box>
  );
}
