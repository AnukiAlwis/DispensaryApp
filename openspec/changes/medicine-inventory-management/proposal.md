## Why

The current medicine listing API returns all medicines regardless of stock availability, making it difficult for doctors to identify which medicines are available for prescribing and for pharmacists to manage inventory efficiently. Additionally, the reorderLevel field currently allows 0, which breaks the low stock alert logic. This change introduces stock status filtering to improve inventory visibility and prescribing workflow.

## What Changes

- **Backend**: Add `StockStatus` enum with values: ALL, REORDER_NEEDED, UNAVAILABLE, IN_STOCK
- **Backend**: Update `GET /medicines` endpoint to accept optional `stockStatus` query parameter (comma-separated values)
- **Backend**: Update medicine filtering logic to always exclude `isActive=false` medicines
- **Backend**: Add validation to require `reorderLevel >= 1` in both DTO and entity
- **Frontend**: Update `medicineService.getAll()` to support `stockStatus` parameter
- **Frontend**: Add multi-select filter dropdown to MedicineManagementPage with options: IN_STOCK, REORDER_NEEDED, UNAVAILABLE (default: all selected)
- **Frontend**: Update MedicineAutocomplete to use `IN_STOCK,REORDER_NEEDED` filter for consultation page
- **Frontend**: Update MedicineForm validation to require `reorderLevel >= 1`

## Capabilities

### New Capabilities
- `medicine-stock-filtering`: Stock status-based filtering of medicine inventory with support for multiple status selection

### Modified Capabilities
- `medicine-management`: Update to include reorderLevel validation requirement (minimum 1) and isActive filtering

## Impact

- **API**: `GET /medicines` endpoint gains optional `stockStatus` query parameter (backward compatible, defaults to ALL)
- **Database**: No schema changes, only validation updates
- **Frontend**: MedicineManagementPage gains new filter UI component
- **Consultation workflow**: Doctors will only see medicines with available stock (IN_STOCK or REORDER_NEEDED)
- **Inventory management**: Pharmacists can filter medicines by stock status for better visibility
