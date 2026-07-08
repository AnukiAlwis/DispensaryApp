import { Chip, ChipProps } from "@mui/material";

type SemanticStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "OPEN"
  | "BOOKED"
  | "ARRIVED & WAITING"
  | "WAITING"
  | "CHECKED_IN_WAITING"
  | "IN_PROGRESS"
  | "SERVED"
  | "NO_SHOW"
  | "CALLED"
  | "REMOVED"
  | string;

interface StatusChipProps extends Omit<ChipProps, "color"> {
  status: SemanticStatus;
}

const normalizeStatus = (status: string): SemanticStatus => {
  const s = status.trim().toUpperCase().replace(/\s+/g, " ");
  if (s === "ARRIVED & WAITING" || s === "CHECKED_IN_WAITING" || s === "WAITING") {
    return "ARRIVED & WAITING";
  }
  if (s === "IN PROGRESS" || s === "IN_PROGRESS") return "IN_PROGRESS";
  if (s === "NO SHOW" || s === "NO_SHOW") return "NO_SHOW";
  return s as SemanticStatus;
};

export default function StatusChip({ status, ...rest }: StatusChipProps) {
  const normalized = normalizeStatus(status);

  const config: Record<string, { color: ChipProps["color"]; sx: object }> = {
    ACTIVE: { color: "success", sx: {} },
    OPEN: { color: "success", sx: {} },
    BOOKED: { color: "primary", sx: {} },
    "ARRIVED & WAITING": { color: "warning", sx: {} },
    IN_PROGRESS: { color: "info", sx: {} },
    SERVED: { color: "success", sx: {} },
    INACTIVE: { color: "default", sx: { color: "#64748B", borderColor: "#CBD5E1" } },
    NO_SHOW: { color: "error", sx: {} },
    REMOVED: { color: "error", sx: {} },
    CALLED: { color: "info", sx: {} },
  };

  const { color, sx } = config[normalized] || {
    color: "default" as const,
    sx: { color: "#64748B", borderColor: "#CBD5E1" },
  };

  return (
    <Chip
      label={normalized}
      color={color}
      variant={normalized === "INACTIVE" ? "outlined" : "filled"}
      size="small"
      sx={sx}
      {...rest}
    />
  );
}
