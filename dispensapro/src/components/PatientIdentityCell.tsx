import { Avatar, Box, Typography } from "@mui/material";

interface PatientIdentityCellProps {
  firstName?: string;
  lastName?: string;
  id?: string;
  size?: "small" | "medium" | "large";
}

export default function PatientIdentityCell({
  firstName = "",
  lastName = "",
  id,
  size = "medium",
}: PatientIdentityCellProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const fullName = `${firstName} ${lastName}`.trim() || "—";

  const avatarSize = size === "small" ? 32 : size === "large" ? 48 : 38;
  const fontSize = size === "small" ? "0.75rem" : size === "large" ? "1.1rem" : "0.9rem";
  const nameVariant = size === "large" ? "h6" : "body2";

  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      <Avatar
        sx={{
          width: avatarSize,
          height: avatarSize,
          fontSize,
          fontWeight: 700,
          bgcolor: "primary.light",
          color: "primary.dark",
        }}
      >
        {initials}
      </Avatar>
      <Box>
        <Typography variant={nameVariant} sx={{ fontWeight: 600, color: "#1E293B", lineHeight: 1.3 }}>
          {fullName}
        </Typography>
        {id && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
            ID: {id}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
