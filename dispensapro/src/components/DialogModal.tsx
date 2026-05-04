import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { ReactNode } from "react";

interface DialogModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave?: () => void;
  children: ReactNode;
}

export default function DialogModal({
  open,
  title,
  onClose,
  onSave,
  children,
}: DialogModalProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {onSave && <Button onClick={onSave}>Save</Button>}
      </DialogActions>
    </Dialog>
  );
}
