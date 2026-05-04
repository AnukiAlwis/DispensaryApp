import React from "react";
import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import { SxProps } from "@mui/system";

type VariantType = "primary" | "outline";

interface ButtonProps extends Omit<MuiButtonProps, "variant" | "color"> {
  variant?: VariantType;
  sx?: SxProps;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  sx,
  children,
  href,
  component,
  ...rest
}) => {
  const colorProps =
    variant === "primary"
      ? { variant: "contained" as const, color: "primary" as const }
      : { variant: "outlined" as const, color: "primary" as const };

  return (
    <MuiButton
      {...colorProps}
      sx={sx}
      {...(href ? { href } : {})}
      {...(component ? { component } : {})}
      {...rest}
    >
      {children}
    </MuiButton>
  );
};
