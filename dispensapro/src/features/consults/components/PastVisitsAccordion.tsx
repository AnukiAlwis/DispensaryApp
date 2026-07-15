import { useState, useMemo } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Box,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataTable from "../../../components/DataTable";
import StatusChip from "../../../components/StatusChip";
import { Visit } from "../../visits/types";

interface PastVisitsAccordionProps {
  visits: Visit[];
}

export default function PastVisitsAccordion({
  visits,
}: PastVisitsAccordionProps) {
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const sortedVisits = useMemo(() => {
    return [...visits].sort(
      (a, b) =>
        new Date(b.visitTime || b.createdAt || 0).getTime() -
        new Date(a.visitTime || a.createdAt || 0).getTime()
    );
  }, [visits]);

  const visibleVisits = sortedVisits.slice(0, visibleCount);
  const canShowMore = visibleCount < sortedVisits.length && visibleCount < 10;

  const columns = [
    {
      id: "visitTime",
      label: "Visit Date/Time",
      render: (row: Visit) =>
        row.visitTime
          ? new Date(row.visitTime).toLocaleString()
          : new Date(row.createdAt).toLocaleString(),
    },
    {
      id: "status",
      label: "Status",
      render: (row: Visit) => <StatusChip status={row.status} />,
    },
    {
      id: "notes",
      label: "Notes",
      render: (row: Visit) => {
        if (!row.notes || row.notes.length === 0) {
          return (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          );
        }
        return (
          <Stack spacing={0.5} alignItems="flex-start">
            {row.notes.map((note) => (
              <Box key={note.id}>
                <Typography variant="body2" sx={{ fontWeight: 600, display: "inline" }}>
                  {note.recordedByUsername}
                  {note.recordedByRole && ` (${note.recordedByRole})`}
                  :{" "}
                </Typography>
                <Typography variant="body2" sx={{ display: "inline" }}>
                  {note.note}
                </Typography>
              </Box>
            ))}
          </Stack>
        );
      },
    },
  ];

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body2" color="text.secondary">
          {visits.length} visits
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {visits.length === 0 ? (
          <Typography color="text.secondary">
            No previous visits to display
          </Typography>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={visibleVisits}
              emptyText="No previous visits to display"
            />
            {canShowMore && (
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 5, 10))}
                >
                  Show More
                </Button>
              </Box>
            )}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
