import { Box, Typography } from "@mui/material";

interface QueueBadgeProps {
  queueNumber: number | string;
  size?: "small" | "medium" | "large";
}

export default function QueueBadge({ queueNumber, size = "medium" }: QueueBadgeProps) {
  const dims = size === "small" ? 64 : size === "large" ? 140 : 96;
  const labelSize = size === "small" ? "0.6rem" : size === "large" ? "0.95rem" : "0.75rem";
  const numberVariant = size === "small" ? "h6" : size === "large" ? "h2" : "h4";

  return (
    <Box
      width={dims}
      height={dims}
      bgcolor="warning.main"
      borderRadius={3}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      boxShadow="0 4px 12px rgba(245, 158, 11, 0.25)"
    >
      <Typography variant="caption" color="white" sx={{ fontSize: labelSize, fontWeight: 600, letterSpacing: 0.5 }}>
        Q/N
      </Typography>
      <Typography variant={numberVariant} color="white" fontWeight="bold" lineHeight={1}>
        {queueNumber}
      </Typography>
    </Box>
  );
}
