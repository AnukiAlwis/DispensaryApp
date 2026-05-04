// src/components/Input.tsx
import React from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useField } from "formik";

interface InputProps extends Omit<TextFieldProps, "name"> {
  name: string;
}

export const Input: React.FC<InputProps> = ({ name, ...props }) => {
  const [field, meta] = useField(name);

  return (
    <TextField
      {...field}
      {...props}
      fullWidth
      error={Boolean(meta.touched && meta.error)}
      helperText={meta.touched && meta.error ? meta.error : props.helperText}
    />
  );
};

export default Input;
