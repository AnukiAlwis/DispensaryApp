import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  Stack,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import { MedicineFormValues } from "../types";

interface MedicineFormProps {
  initialValues?: MedicineFormValues;
  onSubmit: (values: MedicineFormValues) => void;
}

const formOptions = [
  { value: "tablet", label: "Tablet" },
  { value: "capsule", label: "Capsule" },
  { value: "syrup", label: "Syrup" },
  { value: "ointment", label: "Ointment" },
];

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  form: Yup.string().required("Please select a form"),
  strength: Yup.number()
    .typeError("Strength must be numeric")
    .required("Strength is required"),
  unitOfMeasurement: Yup.string().required("Unit of Measurement is required"),
  sellPrice: Yup.number()
    .typeError("Sell price must be a number")
    .positive("Sell price must be greater than 0")
    .max(10000, "Sell price cannot exceed 10,000")
    .required("Sell price is required"),
  quantity: Yup.number()
    .typeError("Quantity must be a number")
    .min(0, "Quantity cannot be negative")
    .required("Quantity is required"),
  reorderLevel: Yup.number()
    .typeError("Reorder level must be a number")
    .min(0, "Reorder level cannot be negative")
    .required("Reorder level is required"),
});

const MedicineForm: React.FC<MedicineFormProps> = ({
  initialValues,
  onSubmit,
}) => {
  const [showZeroQtyAlert, setShowZeroQtyAlert] = useState(false);
  const [pendingValues, setPendingValues] = useState<MedicineFormValues | null>(null);

  const formik = useFormik<MedicineFormValues>({
    initialValues: initialValues || {
      name: "",
      form: "",
      strength: "",
      unitOfMeasurement: "",
      sellPrice: 0,
      quantity: 0,
      reorderLevel: 50,
    },
    validationSchema,
    onSubmit: (values) => {
      if (values.quantity === 0) {
        setPendingValues(values);
        setShowZeroQtyAlert(true);
      } else {
        onSubmit(values);
      }
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleConfirmZeroQty = () => {
    if (pendingValues) {
      onSubmit(pendingValues);
      setShowZeroQtyAlert(false);
      setPendingValues(null);
    }
  };

  const handleCancelZeroQty = () => {
    setShowZeroQtyAlert(false);
    setPendingValues(null);
    formik.setSubmitting(false);
  };

  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Name"
            name="name"
            fullWidth
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />

          <TextField
            select
            label="Form"
            name="form"
            fullWidth
            value={formik.values.form}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.form && Boolean(formik.errors.form)}
            helperText={formik.touched.form && formik.errors.form}
          >
            {formOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Strength"
            name="strength"
            type="number"
            fullWidth
            placeholder="e.g. 25 (only enter number)"
            value={formik.values.strength}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.strength && Boolean(formik.errors.strength)}
            helperText={formik.touched.strength && formik.errors.strength}
          />

          <TextField
            label="Unit of Measurement"
            name="unitOfMeasurement"
            placeholder="e.g. mg, mL, IU"
            fullWidth
            value={formik.values.unitOfMeasurement}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.unitOfMeasurement &&
              Boolean(formik.errors.unitOfMeasurement)
            }
            helperText={
              formik.touched.unitOfMeasurement &&
              formik.errors.unitOfMeasurement
            }
          />

          <TextField
            label="Sell Price"
            name="sellPrice"
            type="number"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">LKR</InputAdornment>
              ),
            }}
            value={formik.values.sellPrice}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.sellPrice && Boolean(formik.errors.sellPrice)}
            helperText={formik.touched.sellPrice && formik.errors.sellPrice}
          />

          <TextField
            label="Quantity"
            name="quantity"
            type="number"
            fullWidth
            value={formik.values.quantity}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.quantity && Boolean(formik.errors.quantity)}
            helperText={formik.touched.quantity && formik.errors.quantity}
          />

          <TextField
            label="Reorder Level"
            name="reorderLevel"
            type="number"
            fullWidth
            value={formik.values.reorderLevel}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.reorderLevel && Boolean(formik.errors.reorderLevel)
            }
            helperText={
              formik.touched.reorderLevel && formik.errors.reorderLevel
            }
          />
          <Box textAlign="right" mt={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!formik.isValid || formik.isSubmitting}
            >
              Submit
            </Button>
          </Box>
        </Stack>
      </form>

      <Dialog open={showZeroQtyAlert} onClose={handleCancelZeroQty}>
        <DialogTitle>
          <Alert severity="warning" sx={{ mb: 1 }}>
            quantity(qty) field did not get updated.
          </Alert>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            are you sure
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {pendingValues?.name || "Medicine"} {pendingValues?.strength || ""}{pendingValues?.unitOfMeasurement || ""} quantity in the stock is 0 ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelZeroQty} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmZeroQty} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MedicineForm;
