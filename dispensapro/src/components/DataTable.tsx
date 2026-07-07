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
  Button,
  Tooltip,
  Stack,
  Box,
} from "@mui/material";
import { ReactNode, useState, ElementType } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export interface CustomAction {
  icon: ElementType;
  tooltip: string;
  onClick: (row: any) => void;
  text?: string; // ✅ optional text next to icon
}

export interface Column {
  id: string;
  label: string;
  sortable?: boolean;
  render?: (row: any) => ReactNode;
}

interface DataTableProps {
  columns: Column[];
  rows: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  editText?: string; // ✅ optional text for edit
  deleteText?: string; // ✅ optional text for delete
  customActions?: CustomAction[];
}

export default function DataTable({
  columns,
  rows,
  onEdit,
  onDelete,
  editText,
  deleteText,
  customActions = [],
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

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <TableContainer component={Paper}>
        <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id}>
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
            {showActionsColumn && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>

        <TableBody>
          {sortedRows.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => (
                <TableCell key={col.id}>
                  {col.render ? col.render(row) : row[col.id]}
                </TableCell>
              ))}

              {showActionsColumn && (
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {/* ✅ Edit Button */}
                    {onEdit && (
                      <Tooltip title="Edit">
                        <Button
                          onClick={() => onEdit(row)}
                          size="small"
                          startIcon={<EditIcon fontSize="small" />}
                        >
                          {editText || ""}
                        </Button>
                      </Tooltip>
                    )}

                    {/* ✅ Delete Button */}
                    {onDelete && (
                      <Tooltip title="Delete">
                        <Button
                          onClick={() => onDelete(row)}
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon fontSize="small" />}
                        >
                          {deleteText || ""}
                        </Button>
                      </Tooltip>
                    )}

                    {/* ✅ Custom Actions */}
                    {customActions.map((action, index) => (
                      <Tooltip title={action.tooltip} key={index}>
                        <Button
                          onClick={() => action.onClick(row)}
                          size="small"
                          startIcon={<action.icon fontSize="small" />}
                        >
                          {action.text || ""}
                        </Button>
                      </Tooltip>
                    ))}
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
