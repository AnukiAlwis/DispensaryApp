## Context

Current system:
- `GET /medicines` endpoint returns all medicines without stock-based filtering
- `reorderLevel` field allows 0 value, which breaks low stock alert logic
- MedicineAutocomplete in consultation page shows all medicines including out-of-stock
- MedicineManagementPage has no stock status filtering capability
- `isActive` field exists but is not consistently applied in filtering

Constraints:
- API changes must be backward compatible
- No database schema changes allowed
- Frontend uses Material-UI components
- Backend uses Spring Boot with JPA

## Goals / Non-Goals

**Goals:**
- Add stock status filtering to medicines API with comma-separated parameter support
- Enforce reorderLevel minimum value of 1
- Always exclude inactive medicines from listings
- Provide consultation page with available medicines only (IN_STOCK, REORDER_NEEDED)
- Add multi-select filter UI to pharmacy management page

**Non-Goals:**
- Database schema changes
- Batch-level stock tracking (future enhancement)
- Real-time stock validation during prescription (current scope is display filtering only)
- Stock status history or audit trail
- Automatic reorder notifications (beyond existing visual alerts)

## Decisions

### 1. Comma-separated query parameter format
**Decision:** Use comma-separated string for multiple stock statuses (e.g., `?stockStatus=IN_STOCK,REORDER_NEEDED`)

**Rationale:**
- Simple to implement and parse
- Standard HTTP practice for multi-value parameters
- Easy to test and debug
- No need for complex array serialization

**Alternatives considered:**
- Multiple parameters (`?stockStatus=IN_STOCK&stockStatus=REORDER_NEEDED`): More verbose, harder to parse in Spring
- JSON array (`?stockStatus=["IN_STOCK","REORDER_NEEDED"]`): Overkill, requires URL encoding

### 2. Stock status filtering in service layer
**Decision:** Implement filtering logic in MedicineService using stream operations after fetching base data

**Rationale:**
- Keeps repository simple (no complex custom queries needed)
- Easier to test and maintain
- Allows combining isActive filtering with stock status in one place
- Performance impact minimal for typical medicine inventory sizes (<1000 items)

**Alternatives considered:**
- Custom repository queries with @Query annotation: More performant for large datasets but adds complexity
- Database-level filtering: Would require complex SQL with CASE statements, harder to maintain

### 3. Consultation page hardcoded filter
**Decision:** Hardcode `IN_STOCK,REORDER_NEEDED` filter in MedicineAutocomplete component

**Rationale:**
- Consistent behavior across all consultations
- No need for user configuration
- Doctors should always see available medicines for prescribing
- Simpler implementation

**Alternatives considered:**
- User-configurable filter per doctor: Adds complexity without clear benefit
- Tenant-level configuration: Over-engineering for current requirements

### 4. Multi-select UI using Material-UI
**Decision:** Use Material-UI Select component with multiple selection and checkboxes

**Rationale:**
- Consistent with existing UI patterns in the application
- Built-in component reduces custom code
- Good accessibility support
- Familiar UX pattern

**Alternatives considered:**
- Custom dropdown with checkboxes: More control but more code
- Chip-based selection: Different UX pattern, may confuse users

### 5. Validation placement
**Decision:** Add validation in both backend DTO (@Min(1)) and frontend form (Yup.min(1))

**Rationale:**
- Defense in depth - both layers validate
- Backend is source of truth
- Frontend provides immediate user feedback
- Prevents invalid data from reaching the database

**Alternatives considered:**
- Backend only: Poor UX, delayed error feedback
- Frontend only: Can be bypassed, data integrity risk

## Risks / Trade-offs

### Risk: Performance impact of stream-based filtering
**Mitigation:** For typical inventory sizes (<1000 medicines), stream filtering is negligible. If inventory grows significantly, can optimize with custom repository queries later.

### Risk: Existing medicines with reorderLevel=0
**Mitigation:** No migration script (per user decision). These medicines will fail validation on next update. Consider adding a data cleanup task if this becomes problematic.

### Trade-off: Backend filtering vs frontend filtering
**Decision:** Backend filtering chosen for consistency and security.
**Trade-off:** Slightly more network data if frontend could filter, but ensures all consumers get same behavior.

### Risk: Breaking changes for API consumers
**Mitigation:** stockStatus parameter is optional with default "ALL", making change backward compatible. Existing consumers continue to work without modification.

### Risk: isActive filtering inconsistency
**Mitigation:** Apply isActive filtering consistently in service layer for all listing operations. Document this behavior in API documentation.

## Migration Plan

### Deployment Steps
1. Deploy backend changes (enum, validation, service logic)
2. Deploy frontend changes (service, components, validation)
3. Update API documentation to document new parameter
4. Update MainStory.md with stock status enum definitions

### Rollback Strategy
- Backend: Revert to previous version (no data changes, safe rollback)
- Frontend: Revert to previous version (no local storage dependencies)
- No database migrations needed, so zero rollback risk

### Testing Strategy
- Unit tests for StockStatus enum parsing
- Unit tests for filtering logic in service layer
- Integration tests for API endpoint with various parameter combinations
- Frontend component tests for multi-select dropdown
- E2E test for consultation page medicine selection
- E2E test for pharmacy management page filtering
