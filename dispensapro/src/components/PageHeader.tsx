import { Box, Typography, Button, Stack } from "@mui/material";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  action,
  children,
}: PageHeaderProps) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      flexDirection={{ xs: "column", sm: "row" }}
      gap={2}
      mb={3}
    >
      <Box>
        <Typography variant="h5" gutterBottom={false}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <Stack direction="row" spacing={1} alignItems="center">
        {children}
        {action && (
          <Button
            variant="contained"
            color="primary"
            startIcon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
