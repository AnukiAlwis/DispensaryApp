import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  Stack,
  Divider,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import apiClient from "../../../services/apiClient";
import { showSnackbar } from "../../../utils/showSnackbar";
import { QueueStatus } from "../../../types/enums";
import QueueBadge from "../../../components/QueueBadge";
import StatusChip from "../../../components/StatusChip";
import PatientIdentityCell from "../../../components/PatientIdentityCell";

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
  checkedInAt?: string | null;
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
  const [success, setSuccess] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const queryClient = useQueryClient();

  const checkInMutation = useMutation({
    mutationFn: (queueId: string) => apiClient.patch(`/queue/${queueId}/check-in`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["summary", "today"] });
    }
  });

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
    setSuccess(false);
  };

  const handleConfirm = async () => {
    if (!selectedQueue) return;
    try {
      const res = await checkInMutation.mutateAsync(selectedQueue.id);
      const updated: QueueSearchResult = res.data;
      setSelectedQueue(updated);
      setSuccess(true);
      showSnackbar("Patient checked in successfully");
    } catch {
      // error toast already shown by apiClient interceptor
    }
  };

  const handleClose = () => {
    setInputValue("");
    setOptions([]);
    setSelectedQueue(null);
    setSuccess(false);
    onClose();
  };

  const optionLabel = (option: QueueSearchResult) =>
    `${option.patientName} - ${option.patientContact || "-"} - Dr. ${option.doctorName} - Q/N ${option.queueNumber}`;

  const renderOption = (props: any, option: QueueSearchResult) => (
    <Box component="li" {...props} display="flex" alignItems="center" gap={1.5} px={1.5} py={1}>
      <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.light", color: "primary.dark", fontSize: "0.8rem", fontWeight: 700 }}>
        {option.patientName?.charAt(0).toUpperCase() || "?"}
      </Avatar>
      <Box flex={1}>
        <Typography variant="body2" fontWeight={600}>
          {option.patientName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {option.patientContact || "-"} · Dr. {option.doctorName}
        </Typography>
      </Box>
      <QueueBadge queueNumber={option.queueNumber} size="small" />
    </Box>
  );

  const alreadyCheckedIn = selectedQueue?.status !== "BOOKED";

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" PaperProps={{ sx: { overflow: "hidden" } }}>
      <DialogTitle sx={{ px: 3, pt: 3, pr: 6, fontWeight: 700, fontSize: "1.15rem" }}>
        Patient Check-In
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400 }}>
          Search and select a booked patient to confirm their arrival.
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 2}}>
        {!success ? (
          <Box display="flex" flexDirection="column" gap={2.5} sx={{ pt:3}}>
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
                  label="Search patient"
                  placeholder="Search by patient name or phone number"
                  autoFocus
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon fontSize="small" sx={{ color: "text.secondary", ml: 0.5, mr: 0.5 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
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
                p={2.5}
                borderRadius={3}
                border="1px solid #E5E9F0"
                bgcolor="background.paper"
              >
                <Typography variant="subtitle2" sx={{ mb: 2, fontSize: "0.9rem" }}>
                  Visit Details
                </Typography>
                <Stack spacing={1.5}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Patient
                    </Typography>
                    <PatientIdentityCell
                      firstName={selectedQueue.patientName}
                      lastName=""
                      id={selectedQueue.patientId}
                      size="small"
                    />
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedQueue.patientContact || "-"}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Doctor
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      Dr. {selectedQueue.doctorName}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Visit Status
                    </Typography>
                    <StatusChip status={selectedQueue.status} />
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Arrival Status
                    </Typography>
                    <Chip
                      label={alreadyCheckedIn ? "Arrived" : "Not Checked In"}
                      size="small"
                      color={alreadyCheckedIn ? "success" : "default"}
                      variant={alreadyCheckedIn ? "filled" : "outlined"}
                      sx={alreadyCheckedIn ? {} : { color: "#64748B", borderColor: "#CBD5E1" }}
                    />
                  </Box>
                </Stack>
              </Box>
            )}
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" py={2}>
            <Box
              width={72}
              height={72}
              borderRadius="50%"
              bgcolor="success.light"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={2}
            >
              <CheckCircleIcon sx={{ width: 40, height: 40, color: "success.main" }} />
            </Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Check-In Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Patient has been checked in and added to the queue.
            </Typography>

            <Box
              width="100%"
              p={2.5}
              borderRadius={3}
              border="1px solid #E5E9F0"
              bgcolor="background.paper"
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              alignItems="center"
              gap={3}
              textAlign={{ xs: "center", sm: "left" }}
            >
              <Box flex={1} display="flex" flexDirection="column" gap={1.5}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Patient Name</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedQueue?.patientName}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Doctor</Typography>
                  <Typography variant="body2" fontWeight={600}>Dr. {selectedQueue?.doctorName}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <StatusChip status={selectedQueue?.status || "CHECKED_IN_WAITING"} />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Checked In At</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatDateTime(selectedQueue?.checkedInAt)}</Typography>
                </Box>
              </Box>
              <QueueBadge queueNumber={selectedQueue?.queueNumber || 0} size="medium" />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button onClick={handleClose}>
          {success ? "Close" : "Cancel"}
        </Button>
        {!success && selectedQueue && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            disabled={checkInMutation.isPending || alreadyCheckedIn}
            endIcon={
              checkInMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />
            }
          >
            {checkInMutation.isPending
              ? "Confirming..."
              : alreadyCheckedIn
              ? "Already Checked-In"
              : "Confirm Check-In"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

