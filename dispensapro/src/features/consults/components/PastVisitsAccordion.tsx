import { useState, useMemo } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataTable from "../../../components/DataTable";
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
      render: (row: Visit) => row.status,
    },
  ];

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      sx={{ mb: 3 }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" sx={{ fontSize: "1.05rem" }}>
          Past Visits ({visits.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {visits.length === 0 ? (
          <Typography color="text.secondary">
            No previous visits to display
          </Typography>
        ) : (
          <>
            <DataTable columns={columns} rows={visibleVisits} />
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
