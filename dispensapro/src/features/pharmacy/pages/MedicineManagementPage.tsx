import React, { useState, useMemo, useEffect } from "react";
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ElevatedCard from "../../../components/ElevatedCard";
import DataTable, { Column, CustomAction } from "../../../components/DataTable";
import DialogModal from "../../../components/DialogModal";
import MedicineForm from "../components/MedicineForm";
import useMedicine from "../hooks/useMedicine";
import { useHasPermission } from "../../../hooks/usePermissions";
import { Medicine, MedicineFormValues } from "../types";

const MEDICINE_COLUMNS: Column[] = [
  { id: "name", label: "Name", sortable: true },
  { id: "form", label: "Form", sortable: true },
  {
    id: "strength",
    label: "Strength",
    sortable: true,
    render: (row) => (
      <Typography>{row.strength + " " + row.unitOfMeasurement}</Typography>
    ),
  },
  //   { id: "unitOfMeasurement", label: "Unit Of Mesurement", sortable: true },
  {
    id: "quantity",
    label: "Stock Qty",
    sortable: true,
    render: (row) => (
      <Typography
        color={row.quantity <= row.reorderLevel ? "error" : "textPrimary"}
        fontWeight={row.quantity <= row.reorderLevel ? "bold" : "normal"}
      >
        {row.quantity}
      </Typography>
    ),
  },
  { id: "reorderLevel", label: "Reorder Level", sortable: true },
  {
    id: "sellPrice",
    label: "Price(LKR)",
    sortable: true,
    render: (row) => `${row.sellPrice ? row.sellPrice.toFixed(2) : "0.00"}`,
  },
  // No action columns
];

const STOCK_STATUS_OPTIONS = [
  "IN_STOCK",
  "REORDER_NEEDED",
  "UNAVAILABLE"
] as const;

export default function MedicinePage() {
  const { medicines, addMedicine, fetchMedicines, loading, error } =
    useMedicine();
  const canManagePharmacy = useHasPermission("PHARMACY_MANAGE");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<string[]>([...STOCK_STATUS_OPTIONS]);

  useEffect(() => {
    const stockStatus = stockFilter.join(",");
    fetchMedicines({ stockStatus });
  }, [stockFilter]);

  const handleCreateMedicine = async (values: MedicineFormValues) => {
    const newMedicine: Omit<Medicine, "id"> = {
      ...values,
      strength: values.strength.toString(),
      unitOfMeasurement: values.unitOfMeasurement || null,
    };

    try {
      await addMedicine(newMedicine);
      await fetchMedicines();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding medicine:", err);
    }
  };

  const filteredMedicines = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    if (!lowerCaseSearch) return medicines;

    return medicines.filter(
      (medicine) =>
        medicine.name.toLowerCase().includes(lowerCaseSearch) ||
        medicine.form.toLowerCase().includes(lowerCaseSearch) ||
        medicine.unitOfMeasurement?.toLowerCase().includes(lowerCaseSearch) ||
        medicine.strength.toLowerCase().includes(lowerCaseSearch)
    );
  }, [medicines, searchTerm]);

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5">Medicine Inventory Management</Typography>
        {canManagePharmacy && (
          <Button
            variant="contained"
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            Add Medicine
          </Button>
        )}
      </Box>

      {/* Medicine List Table */}
      <ElevatedCard>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Stock Status</InputLabel>
            <Select
              multiple
              label="Stock Status"
              value={stockFilter}
              onChange={(e) => {
                const value = e.target.value as string[];
                // Prevent deselecting the last checkbox
                if (value.length > 0) {
                  setStockFilter(value);
                }
              }}
              renderValue={(selected) => selected.join(", ")}
            >
              {STOCK_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  <Checkbox checked={stockFilter.indexOf(status) > -1} />
                  <ListItemText primary={status.replace("_", " ")} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Search Medicines"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: "100%", sm: "400px" } }}
          />
        </Box>
        <DataTable columns={MEDICINE_COLUMNS} rows={filteredMedicines} />
      </ElevatedCard>

      {/* Add/Create Modal */}
      <DialogModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Medicine"
      >
        <MedicineForm onSubmit={handleCreateMedicine} />
      </DialogModal>
    </Box>
  );
}
