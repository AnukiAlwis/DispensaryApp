import { Card, CardContent } from "@mui/material";
import { ReactNode } from "react";

interface ElevatedCardProps {
  children: ReactNode;
}

export default function ElevatedCard({ children }: ElevatedCardProps) {
  return (
    <Card
      elevation={3}
      sx={{
        width: "100%",
        borderRadius: 2,
        overflow: "hidden",
        mb: 2,
      }}
    >
      <CardContent>{children}</CardContent>
    </Card>
  );
}
