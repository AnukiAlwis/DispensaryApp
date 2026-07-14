import { Typography } from "@mui/material";
import DialogModal from "../../../components/DialogModal";

interface CompletionModalProps {
  open: boolean;
  queueNumber: number;
  onClose: () => void;
}

export default function CompletionModal({
  open,
  queueNumber,
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
      <Typography>
        Queue number {queueNumber} finished serving. Prescription sent to pharmacist.
      </Typography>
    </DialogModal>
  );
}
