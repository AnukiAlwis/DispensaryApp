import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Box,
  Typography,
} from "@mui/material";
import { ReactNode, useState, ElementType } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export interface CustomAction {
  icon: ElementType;
  tooltip: string;
  onClick: (row: any) => void;
  text?: string;
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning" | "default";
}

export interface Column {
  id: string;
  label: string;
  sortable?: boolean;
  render?: (row: any) => ReactNode;
  align?: "left" | "right" | "center";
}

interface DataTableProps {
  columns: Column[];
  rows: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  customActions?: CustomAction[];
  emptyText?: string;
}

export default function DataTable({
  columns,
  rows,
  onEdit,
  onDelete,
  customActions = [],
  emptyText = "No records to display",
}: DataTableProps) {
  const [orderBy, setOrderBy] = useState<string>("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (colId: string) => {
    const isAsc = orderBy === colId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(colId);
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (!orderBy) return 0;
    if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
    return 0;
  });

  const showActionsColumn = onEdit || onDelete || customActions.length > 0;

  if (rows.length === 0) {
    return (
      <Box py={5} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          {emptyText}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflowX: "auto" }}>
      <TableContainer component={Paper} variant="outlined" sx={{ border: "none", borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align || "left"}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={order}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
              {showActionsColumn && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedRows.map((row, idx) => (
              <TableRow key={idx} hover>
                {columns.map((col) => (
                  <TableCell key={col.id} align={col.align || "left"}>
                    {col.render ? col.render(row) : row[col.id]}
                  </TableCell>
                ))}

                {showActionsColumn && (
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                      {onEdit && (
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(row)}
                            sx={{ color: "primary.main" }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {onDelete && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => onDelete(row)}
                            sx={{ color: "error.main" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {customActions.map((action, index) => (
                        <Tooltip title={action.tooltip} key={index}>
                          <IconButton
                            size="small"
                            onClick={() => action.onClick(row)}
                            color={action.color || "primary"}
                          >
                            <action.icon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ))}

                      <Tooltip title="More">
                        <IconButton size="small" sx={{ color: "text.secondary" }}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
