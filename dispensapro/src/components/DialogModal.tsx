import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Breakpoint,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ReactNode } from "react";

interface DialogModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSave?: () => void;
  children: ReactNode;
  cancelText?: string;
  saveText?: string;
  maxWidth?: Breakpoint;
  hideCancel?: boolean;
  hideSave?: boolean;
}

export default function DialogModal({
  open,
  title,
  subtitle,
  onClose,
  onSave,
  children,
  cancelText = "Cancel",
  saveText = "Save",
  maxWidth = "sm",
  hideCancel = false,
  hideSave = false,
}: DialogModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={isMobile ? "xs" : maxWidth}
      fullScreen={isMobile}
      PaperProps={{ sx: { overflow: "hidden" } }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 3,
          pb: subtitle ? 0.5 : 1.5,
          pr: 6,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" component="span" sx={{ fontWeight: 700, fontSize: "1.15rem" }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 2 }}>{children}</DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        {!hideCancel && <Button onClick={onClose}>{cancelText}</Button>}
        {!hideSave && onSave && (
          <Button variant="contained" onClick={onSave}>
            {saveText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
