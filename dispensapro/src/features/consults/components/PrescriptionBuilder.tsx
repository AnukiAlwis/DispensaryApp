import { useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Grid,
  TextField,
  Autocomplete,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MedicineAutocomplete from "./MedicineAutocomplete";
import PrescriptionItemRow from "./PrescriptionItemRow";
import { Medicine } from "../../pharmacy/types";
import { PrescriptionItem, PrescriptionItemRequestDto } from "../types";
import { prescriptionService } from "../services/prescriptionService";

interface PrescriptionBuilderProps {
  prescriptionId: string;
  committedItems: PrescriptionItem[];
  disabled?: boolean;
  onItemAdded: (item: PrescriptionItem) => void;
  onPrescriptionChanged: () => void;
}

export default function PrescriptionBuilder({
  prescriptionId,
  committedItems,
  disabled = false,
  onItemAdded,
  onPrescriptionChanged,
}: PrescriptionBuilderProps) {
  const [draftMedicine, setDraftMedicine] = useState<Medicine | null>(null);

  const handleMedicineSelect = (medicine: Medicine) => {
    setDraftMedicine(medicine);
  };

  const handleConfirm = async (item: PrescriptionItemRequestDto) => {
    try {
      const addedItem = await prescriptionService.addItem(prescriptionId, item);
      const newItem: PrescriptionItem = {
        id: addedItem.id,
        prescriptionId,
        medicineId: item.medicineId,
        medicine: draftMedicine || undefined,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.durationDays,
        instructions: item.instructions,
        quantity: item.qtyPrescribed,
      };
      onItemAdded(newItem);
      onPrescriptionChanged();
      setDraftMedicine(null);
    } catch (error) {
      // apiClient shows error snackbar; do not add locally on failure
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontSize: "1.05rem", mb: 2 }}>
        Prescription Builder
      </Typography>
      <MedicineAutocomplete onSelect={handleMedicineSelect} disabled={disabled} />

      {draftMedicine && (
        <PrescriptionItemRow
          medicine={draftMedicine}
          onConfirm={handleConfirm}
          disabled={disabled}
        />
      )}

      {committedItems.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Committed Items
          </Typography>
          {committedItems.map((item) => (
            <CommittedItemRow key={item.id} item={item} />
          ))}
        </>
      )}
    </Box>
  );
}

function CommittedItemRow({ item }: { item: PrescriptionItem }) {
  const medicineName = `${item.medicine?.name || "Medicine"} ${
    item.medicine?.strength || ""
  }`.trim();

  return (
    <Box
      sx={{
        p: 2,
        mb: 1,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        backgroundColor: "action.hover",
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            fullWidth
            label="Medicine"
            value={medicineName}
            InputProps={{ readOnly: true }}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <TextField fullWidth label="Dosage" value={item.dosage} disabled />
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Autocomplete
            freeSolo
            options={[item.frequency]}
            value={item.frequency}
            disabled
            renderInput={(params) => (
              <TextField {...params} label="Frequency" fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 1 }}>
          <TextField
            fullWidth
            type="number"
            label="Days"
            value={item.duration}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12, sm: "auto" }}>
          <Typography
            variant="body1"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minWidth: 24,
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            =
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 1 }}>
          <TextField
            fullWidth
            label="Qty"
            value={item.quantity}
            InputProps={{ readOnly: true }}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Coming Soon - Edit functionality pending backend API">
              <span>
                <IconButton disabled size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Coming Soon - Delete functionality pending backend API">
              <span>
                <IconButton disabled size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
