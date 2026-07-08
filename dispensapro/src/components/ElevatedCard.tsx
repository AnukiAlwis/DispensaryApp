import { Card, CardContent } from "@mui/material";
import { ReactNode } from "react";

interface ElevatedCardProps {
  children: ReactNode;
  noPadding?: boolean;
}

export default function ElevatedCard({ children, noPadding = false }: ElevatedCardProps) {
  return (
    <Card
      sx={{
        width: "100%",
        overflow: "hidden",
        mb: 3,
      }}
    >
      <CardContent sx={{ p: noPadding ? 0 : 3, "&:last-child": { pb: noPadding ? 0 : 3 } }}>
        {children}
      </CardContent>
    </Card>
  );
}
