import { useState, useEffect } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { medicineService } from "../../pharmacy/services/medicineService";
import { Medicine } from "../../pharmacy/types";

interface MedicineAutocompleteProps {
  onSelect: (medicine: Medicine) => void;
  disabled?: boolean;
}

export default function MedicineAutocomplete({
  onSelect,
  disabled = false,
}: MedicineAutocompleteProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      try {
        const data = await medicineService.getAll();
        setMedicines(data || []);
      } catch (err: any) {
        console.error("Failed to fetch medicines:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const getOptionLabel = (option: Medicine) =>
    `${option.name} ${option.strength || ""}`.trim();

  return (
    <Autocomplete
      options={medicines}
      getOptionLabel={getOptionLabel}
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
      onChange={(_, selectedMedicine) => {
        if (selectedMedicine) {
          onSelect(selectedMedicine);
          setInputValue("");
        }
      }}
      filterOptions={(options, { inputValue }) =>
        options.filter((option) =>
          option.name.toLowerCase().includes(inputValue.toLowerCase())
        )
      }
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Medicine"
          placeholder="Type medicine name..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
