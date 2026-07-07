import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={isMobile ? "xs" : "sm"}
      fullScreen={isMobile}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {onSave && <Button onClick={onSave}>Save</Button>}
      </DialogActions>
    </Dialog>
  );
}
