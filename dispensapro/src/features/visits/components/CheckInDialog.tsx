import { useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";
import apiClient from "../../../services/apiClient";
import { showSnackbar } from "../../../utils/showSnackbar";
import { QueueStatus } from "../../../types/enums";

interface QueueSearchResult {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  patientContact: string;
  doctorName: string;
  status: QueueStatus;
  queueNumber: number;
  queueDate: string;
}

interface CheckInDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CheckInDialog({ open, onClose }: CheckInDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<QueueSearchResult[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<QueueSearchResult | null>(null);
  const [confirming, setConfirming] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const runSearch = async (term: string) => {
    if (!term.trim()) {
      setOptions([]);
      return;
    }
    setLoadingOptions(true);
    try {
      const res = await apiClient.get("/queue/search", {
        params: { searchTerm: term },
      });
      setOptions(res.data || []);
    } catch {
      setOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => runSearch(value), 400);
  };

  const handleSelect = (queue: QueueSearchResult | null) => {
    setSelectedQueue(queue);
  };

  const handleConfirm = async () => {
    if (!selectedQueue) return;
    setConfirming(true);
    try {
      const res = await apiClient.patch(`/queue/${selectedQueue.id}/check-in`);
      const updated: QueueSearchResult = res.data;
      setSelectedQueue(updated);
      showSnackbar("Patient checked in successfully");
    } catch {
      // error toast already shown by apiClient interceptor
    } finally {
      setConfirming(false);
    }
  };

  const handleClose = () => {
    setInputValue("");
    setOptions([]);
    setSelectedQueue(null);
    onClose();
  };

  const optionLabel = (option: QueueSearchResult) =>
    `${option.patientName} - ${option.patientContact || "-"} - Dr. ${option.doctorName} - Q/N ${option.queueNumber}`;

  const renderOption = (props: any, option: QueueSearchResult) => (
    <Box component="li" {...props} display="flex" alignItems="center" gap={1}>
      <Typography variant="body2">
        {option.patientName} - {option.patientContact || "-"} - Dr. {option.doctorName}
      </Typography>
      <Chip
        label={`Q/N ${option.queueNumber}`}
        size="small"
        sx={{ bgcolor: "orange", color: "white", fontWeight: 600 }}
      />
    </Box>
  );

  const alreadyCheckedIn = selectedQueue?.status !== "BOOKED";

  const getStatusColor = (status: QueueStatus) => {
    switch (status) {
      case "BOOKED":
        return { color: "primary" as const, sx: undefined };
      case "CHECKED_IN_WAITING":
        return { color: undefined, sx: { borderColor: "orange", color: "orange" } };
      default:
        return { color: "default" as const, sx: undefined };
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Patient Check-In</DialogTitle>
      <DialogContent>
        <Box mt={1} display="flex" flexDirection="column" gap={2}>
          <Autocomplete
            options={options}
            getOptionLabel={optionLabel}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            loading={loadingOptions}
            value={selectedQueue}
            onChange={(_, value) => handleSelect(value)}
            filterOptions={(x) => x}
            inputValue={inputValue}
            onInputChange={(_, value, reason) => {
              if (reason === "input") handleInputChange(value);
            }}
            noOptionsText={
              inputValue ? "No matching booked patients" : "Start typing a name or phone number"
            }
            renderOption={renderOption}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search by patient name or phone"
                placeholder="e.g. Anuki or 0771234567"
                autoFocus
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingOptions ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {selectedQueue && (
            <Box
              mt={1}
              p={2}
              borderRadius={2}
              border="1px solid #E5E9F0"
              display="flex"
              flexDirection="column"
              gap={1.25}
            >
              <Typography variant="body1">
                <strong>Patient Name :</strong> {selectedQueue.patientName}
              </Typography>
              <Typography variant="body1">
                <strong>Phone :</strong> {selectedQueue.patientContact || "-"}
              </Typography>
              <Typography variant="body1">
                <strong>Doctor Name :</strong> {selectedQueue.doctorName}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body1">
                  <strong>Queue Number :</strong>
                </Typography>
                <Chip
                  label={`Q/N ${selectedQueue.queueNumber}`}
                  size="small"
                  sx={{ bgcolor: "orange", color: "white", fontWeight: 600 }}
                />
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body1">
                  <strong>Status :</strong>
                </Typography>
                <Chip
                  label={
                    selectedQueue.status === "CHECKED_IN_WAITING"
                      ? "ARRIVED & WAITING"
                      : selectedQueue.status
                  }
                  color={getStatusColor(selectedQueue.status).color}
                  variant="outlined"
                  size="small"
                  sx={getStatusColor(selectedQueue.status).sx}
                />
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        {selectedQueue && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            disabled={confirming || alreadyCheckedIn}
            endIcon={
              confirming ? <CircularProgress size={18} color="inherit" /> : null
            }
          >
            {confirming
              ? "Confirming..."
              : alreadyCheckedIn
              ? "Already Checked-In"
              : "CONFIRM & MARK AS ARRIVED"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
