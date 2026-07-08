import { Box, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { ReactNode } from "react";

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
}

export default function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search by name or phone number...",
  children,
}: DataTableToolbarProps) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      flexDirection={{ xs: "column", sm: "row" }}
      gap={2}
      mb={2.5}
    >
      <TextField
        size="small"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ width: { xs: "100%", sm: 320, md: 400 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </InputAdornment>
          ),
        }}
      />
      {children && (
        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
          {children}
        </Box>
      )}
    </Box>
  );
}
