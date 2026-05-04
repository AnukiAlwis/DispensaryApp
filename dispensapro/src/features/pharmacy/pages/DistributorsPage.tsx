import React, { useState, useMemo } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import ElevatedCard from "../../../components/ElevatedCard";
import DataTable, { Column } from "../../../components/DataTable";
import DialogModal from "../../../components/DialogModal";
import DistributorForm from "../components/DistributorForm";
import useDistributor from "../hooks/useDistributor";
import { Distributor, DistributorFormValues } from "../types";

const DISTRIBUTOR_COLUMNS: Column[] = [
  { id: "name", label: "Name", sortable: true },
  { id: "contact", label: "Contact", sortable: true },
  { id: "address", label: "Address", sortable: true },
  { id: "createdAt", label: "Created At", sortable: true },
];

export default function DistributorPage() {
  const { distributors, addDistributor } = useDistributor();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateDistributor = async (values: DistributorFormValues) => {
    await addDistributor(values);
    setIsModalOpen(false);
  };

  const filteredDistributors = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    if (!lowerSearch) return distributors;

    return distributors.filter(
      (d) =>
        d.name.toLowerCase().includes(lowerSearch) ||
        d.contact.toLowerCase().includes(lowerSearch) ||
        d.address.toLowerCase().includes(lowerSearch)
    );
  }, [distributors, searchTerm]);

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Distributor Management</Typography>
        <Button variant="contained" onClick={() => setIsModalOpen(true)}>
          Add Distributor
        </Button>
      </Box>

      <ElevatedCard>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <TextField
            label="Search Distributors"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: "100%", sm: "400px" } }}
          />
        </Box>
        <DataTable columns={DISTRIBUTOR_COLUMNS} rows={filteredDistributors} />
      </ElevatedCard>

      <DialogModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Distributor"
      >
        <DistributorForm onSubmit={handleCreateDistributor} />
      </DialogModal>
    </Box>
  );
}
