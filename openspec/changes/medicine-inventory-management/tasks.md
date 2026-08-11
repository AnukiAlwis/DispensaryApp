## 1. Backend - Validation Updates

- [x] 1.1 Update MedicineRequestDto validation to require reorderLevel >= 1
- [x] 1.2 Verify Medicine entity has proper validation constraints

## 2. Backend - Stock Status Enum

- [x] 2.1 Create StockStatus enum with values: ALL, REORDER_NEEDED, UNAVAILABLE, IN_STOCK
- [x] 2.2 Add enum parsing logic for comma-separated string input

## 3. Backend - Controller Updates

- [x] 3.1 Update MedicineController.listMedicines() to accept optional stockStatus parameter
- [x] 3.2 Add default value "ALL" for stockStatus parameter
- [x] 3.3 Add error handling for invalid stockStatus values (400 Bad Request)

## 4. Backend - Service Layer Updates

- [x] 4.1 Update MedicineService interface to accept stockStatus parameter
- [x] 4.2 Implement stock status filtering logic in MedicineServiceImpl
- [x] 4.3 Add isActive=true filtering to all medicine listing operations
- [x] 4.4 Implement filtering logic for each stock status (REORDER_NEEDED, UNAVAILABLE, IN_STOCK, ALL)
- [x] 4.5 Add OR logic for multiple comma-separated stock statuses

## 5. Frontend - Service Updates

- [x] 5.1 Update medicineService.getAll() to accept optional stockStatus parameter
- [x] 5.2 Add TypeScript interface for filter options
- [x] 5.3 Update API call to pass stockStatus as query parameter

## 6. Frontend - Form Validation

- [x] 6.1 Update MedicineForm validation schema to require reorderLevel >= 1
- [x] 6.2 Update error message for reorderLevel validation

## 7. Frontend - Medicine Management Page

- [x] 7.1 Add state for stock filter selection (multi-select)
- [x] 7.2 Add Material-UI Select component with multiple selection and checkboxes
- [x] 7.3 Set default selection to all three statuses (IN_STOCK, REORDER_NEEDED, UNAVAILABLE)
- [x] 7.4 Implement validation to prevent deselecting the last checkbox
- [x] 7.5 Connect filter to medicineService.getAll() call
- [x] 7.6 Position filter dropdown near search field

## 8. Frontend - Consultation Page

- [x] 8.1 Update MedicineAutocomplete to use hardcoded filter: IN_STOCK,REORDER_NEEDED
- [x] 8.2 Test that UNAVAILABLE medicines are not shown in consultation

## 9. Documentation

- [x] 9.1 Update MainStory.md with stock status enum definitions and meanings
- [x] 9.2 Document isActive filtering behavior in MainStory.md
- [x] 9.3 Update API documentation for GET /medicines endpoint
- [x] 9.4 Document stockStatus parameter format and values

