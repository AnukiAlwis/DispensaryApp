import { Card, CardContent, Typography, Box } from "@mui/material";
import { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  noPadding?: boolean;
}

export default function SectionCard({
  title,
  action,
  children,
  noPadding = false,
}: SectionCardProps) {
  return (
    <Card sx={{ mb: 3, overflow: "visible" }}>
      {(title || action) && (
        <Box
          sx={{
            px: 3,
            pt: 2.5,
            pb: title || action ? 1.5 : 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {title && (
            <Typography variant="h6" sx={{ fontSize: "1.05rem" }}>
              {title}
            </Typography>
          )}
          {action && <Box>{action}</Box>}
        </Box>
      )}
      <CardContent sx={{ p: noPadding ? 0 : 3, "&:last-child": { pb: noPadding ? 0 : 3 } }}>
        {children}
      </CardContent>
    </Card>
  );
}
