import { Typography, Box, Avatar } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DialogModal from "../../../components/DialogModal";

interface CompletionModalProps {
  open: boolean;
  queueNumber: number;
  patientName?: string;
  onClose: () => void;
}

export default function CompletionModal({
  open,
  queueNumber,
  patientName,
  onClose,
}: CompletionModalProps) {
  return (
    <DialogModal
      open={open}
      title="Consultation Finished"
      onClose={onClose}
      hideCancel
      saveText="CLOSE"
      onSave={onClose}
    >
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Avatar
          sx={{
            bgcolor: "success.main",
            width: 64,
            height: 64,
            mx: "auto",
            mb: 2,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 40 }} />
        </Avatar>
        
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Consultation Completed Successfully!
        </Typography>
        
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Queue #{queueNumber} {patientName ? `- ${patientName}` : ""}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Prescription has been sent to the pharmacist for processing.
        </Typography>
        
        <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
          ✓ Patient consultation complete
          ✓ Prescription generated
          ✓ Sent to pharmacy
        </Typography>
      </Box>
    </DialogModal>
  );
}
