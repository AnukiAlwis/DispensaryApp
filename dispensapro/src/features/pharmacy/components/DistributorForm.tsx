import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextField, Button, Box, Stack } from "@mui/material";
import { DistributorFormValues } from "../types";

interface DistributorFormProps {
  initialValues?: DistributorFormValues;
  onSubmit: (values: DistributorFormValues) => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Distributor name is required"),
  contact: Yup.string()
    .required("Contact is required")
    .matches(/^(\+94\d{9}|0\d{9})$/, "Check phone number format"),
  address: Yup.string().required("Address is required"),
});

const DistributorForm: React.FC<DistributorFormProps> = ({
  initialValues,
  onSubmit,
}) => {
  const formik = useFormik<DistributorFormValues>({
    initialValues: initialValues || { name: "", contact: "", address: "" },
    validationSchema,
    onSubmit: (values) => onSubmit(values),
    validateOnChange: true,
    validateOnBlur: true,
  });

  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Distributor Name"
            name="name"
            fullWidth
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <TextField
            label="Contact"
            name="contact"
            fullWidth
            value={formik.values.contact}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.contact && Boolean(formik.errors.contact)}
            helperText={formik.touched.contact && formik.errors.contact}
          />
          <TextField
            label="Address"
            name="address"
            fullWidth
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.address && Boolean(formik.errors.address)}
            helperText={formik.touched.address && formik.errors.address}
          />
          <Box textAlign="right" mt={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!formik.isValid || formik.isSubmitting}
            >
              Add Distributor
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
};

export default DistributorForm;
