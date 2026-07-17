## 1. Backend: TenantFilter — Add X-User-ID header parsing

- [ ] 1.1 Open `dispensary/src/main/java/com/anucode/dispensary/filters/TenantFilter.java`. Inside the `doFilter` method, after the line `TenantContext.setTenantId(tenantId);`, add code to read the `X-User-ID` header. If the header is present and non-empty, parse it as a UUID and call `TenantContext.setCurrentUser(UUID.fromString(userIdHeader))`. If the header is absent, do nothing (the existing hardcoded fallback in `TenantContext.getCurrentUser()` handles this). The header read should be: `String userIdHeader = request.getHeader("X-User-ID");` with a null/blank check before parsing.

## 2. Backend: QueueEntryRepository — Add count queries

- [ ] 2.1 Open `dispensary/src/main/java/com/anucode/dispensary/repos/QueueEntryRepository.java`. Add two new methods to the interface. First: `long countByTenantIdAndDoctorIdAndQueueDateAndStatus(UUID tenantId, UUID doctorId, LocalDate queueDate, QueueEntry.Status status);` — this is a Spring Data JPA derived query method, no `@Query` annotation needed. Second: verify the import for `QueueEntry.Status` is available (it should be since `QueueEntry` is already imported). These two methods will be called with `CHECKED_IN_WAITING` and `SERVED` statuses respectively.

## 3. Backend: BillRepository — Add sum queries

- [ ] 3.1 Open `dispensary/src/main/java/com/anucode/dispensary/repos/BillRepository.java`. Add the `@Query` import if not already present: `import org.springframework.data.jpa.repository.Query;` and `import java.math.BigDecimal;` and `import java.time.LocalDate;` and `import java.util.UUID;` (some may already be imported). Add two `@Query` methods. First method for total income: `@Query("SELECT COALESCE(SUM(b.grandTotal), 0) FROM Bill b WHERE b.tenant.id = :tenantId AND b.prescription.doctor.id = :doctorId AND b.status = 'PAID' AND CAST(b.createdAt AS date) = :date") BigDecimal sumIncomeByDoctorAndDate(@Param("tenantId") UUID tenantId, @Param("doctorId") UUID doctorId, @Param("date") LocalDate date);`. Second method for total charity (defensive — computes from raw percentage fields, not final fields, to avoid stale data if `calculateBill` was not called): `@Query("SELECT COALESCE(SUM((b.doctorFee * COALESCE(b.doctorDiscountPct, 0) / 100) + (b.medicineTotal * COALESCE(b.pharmacyDiscountPct, 0) / 100)), 0) FROM Bill b WHERE b.tenant.id = :tenantId AND b.prescription.doctor.id = :doctorId AND CAST(b.createdAt AS date) = :date") BigDecimal sumCharityByDoctorAndDate(@Param("tenantId") UUID tenantId, @Param("doctorId") UUID doctorId, @Param("date") LocalDate date);`. Add `import org.springframework.data.repository.query.Param;` if not present.

  **Charity query explanation**: Instead of using `doctorFeeFinal` and `medicineTotalFinal` (which depend on `calculateBill` being called), this query computes the discount amount directly from the raw percentage fields: `doctorFee × doctorDiscountPct / 100` gives the doctor fee discount, and `medicineTotal × pharmacyDiscountPct / 100` gives the medicine discount. `COALESCE(..., 0)` handles null percentage fields (no discount set = 0 charity). Example: `doctorFee=1000, doctorDiscountPct=20, medicineTotal=500, pharmacyDiscountPct=10` → charity = `(1000×20/100) + (500×10/100)` = `200 + 50` = `250`.

## 4. Backend: DailySummaryDto — Create new DTO

- [ ] 4.1 Create new file `dispensary/src/main/java/com/anucode/dispensary/dtos/DailySummaryDto.java`. Package: `com.anucode.dispensary.dtos`. Use `@Data` from Lombok. Four fields: `long patientsWaiting`, `long patientsServed`, `BigDecimal totalIncome`, `BigDecimal totalCharity`. Import `java.math.BigDecimal` and `lombok.Data`.

## 5. Backend: SummaryService — Create service interface

- [ ] 5.1 Create new file `dispensary/src/main/java/com/anucode/dispensary/services/SummaryService.java`. Package: `com.anucode.dispensary.services`. Define interface with one method: `DailySummaryDto getDailySummary(UUID tenantId, UUID doctorId, LocalDate date);`. Import `com.anucode.dispensary.dtos.DailySummaryDto`, `java.time.LocalDate`, and `java.util.UUID`.

## 6. Backend: SummaryServiceImpl — Create service implementation

- [ ] 6.1 Create new file `dispensary/src/main/java/com/anucode/dispensary/services/serviceImpl/SummaryServiceImpl.java`. Package: `com.anucode.dispensary.services.serviceImpl`. Annotate with `@Service` and `@RequiredArgsConstructor` (from Lombok). Implement `SummaryService` interface. Inject `QueueEntryRepository` and `BillRepository` as final fields (Lombok `@RequiredArgsConstructor` generates constructor). In `getDailySummary` method: (1) call `queueEntryRepository.countByTenantIdAndDoctorIdAndQueueDateAndStatus(tenantId, doctorId, date, QueueEntry.Status.CHECKED_IN_WAITING)` for patientsWaiting, (2) call same method with `QueueEntry.Status.SERVED` for patientsServed, (3) call `billRepository.sumIncomeByDoctorAndDate(tenantId, doctorId, date)` for totalIncome, (4) call `billRepository.sumCharityByDoctorAndDate(tenantId, doctorId, date)` for totalCharity. Construct and return a `DailySummaryDto` with these four values. If any BigDecimal sum is null, default to `BigDecimal.ZERO`. Import `com.anucode.dispensary.entities.QueueEntry`, `com.anucode.dispensary.dtos.DailySummaryDto`, `com.anucode.dispensary.repos.QueueEntryRepository`, `com.anucode.dispensary.repos.BillRepository`, `com.anucode.dispensary.services.SummaryService`, `lombok.RequiredArgsConstructor`, `org.springframework.stereotype.Service`, `java.math.BigDecimal`, `java.time.LocalDate`, `java.util.UUID`.

## 7. Backend: SummaryController — Create REST controller

- [ ] 7.1 Create new file `dispensary/src/main/java/com/anucode/dispensary/controllers/SummaryController.java`. Package: `com.anucode.dispensary.controllers`. Annotate with `@RestController`, `@RequestMapping("/summary")`, `@RequiredArgsConstructor`. Inject `SummaryService` as a final field. Add one endpoint: `@GetMapping("/today")` that returns `ResponseEntity<DailySummaryDto>`. Inside the method: get `tenantId` from `UUID.fromString(TenantContext.getTenantId())`, get `doctorId` from `TenantContext.getCurrentUser()`, get `today` from `LocalDate.now()`, call `summaryService.getDailySummary(tenantId, doctorId, today)`, return `ResponseEntity.ok(dto)`. Import `com.anucode.dispensary.config.TenantContext`, `com.anucode.dispensary.dtos.DailySummaryDto`, `com.anucode.dispensary.services.SummaryService`, `lombok.RequiredArgsConstructor`, `org.springframework.http.ResponseEntity`, `org.springframework.web.bind.annotation.*`, `java.time.LocalDate`, `java.util.UUID`.

## 8. Backend: Verify compilation

- [ ] 8.1 Run `mvnw compile` from the `dispensary/` directory to verify the backend compiles without errors. Fix any compilation issues (missing imports, typos) before proceeding to frontend tasks.

## 9. Frontend: apiClient — Add X-User-ID header

- [ ] 9.1 Open `dispensapro/src/services/apiClient.tsx`. In the request interceptor (inside `apiClient.interceptors.request.use`), after the line `config.headers["X-Tenant-ID"] = "f9a84146-cd5d-44da-b689-d6fd1c4ec896";`, add: `config.headers["X-User-ID"] = "3c2c95c5-db0d-42e9-86de-b02cfecddbda";` — this is the same default UUID that `TenantContext` falls back to. This ensures the backend receives the doctor identity header.

## 10. Frontend: summaryService — Create API service

- [ ] 10.1 Create new file `dispensapro/src/services/summaryService.ts`. Import `apiClient` from `./apiClient`. Export a `summaryService` object with one method: `getTodaySummary: async () => { const res = await apiClient.get("/summary/today"); return res.data; }`. Define a TypeScript interface `DailySummary` with fields: `patientsWaiting: number`, `patientsServed: number`, `totalIncome: number`, `totalCharity: number`. Export this interface. The return type of `getTodaySummary` should be `Promise<DailySummary>`.

## 11. Frontend: useSummary — Create React Query hook

- [ ] 11.1 Create new file `dispensapro/src/layouts/useSummary.ts`. Import `useQuery` from `@tanstack/react-query` (check existing hooks like `useQueue.ts` for the exact import path pattern). Import `summaryService` and `DailySummary` from `../services/summaryService`. Export a `useSummary` hook that calls `useQuery({ queryKey: ["summary", "today"], queryFn: summaryService.getTodaySummary, refetchInterval: 30000, staleTime: 15000 })`. Return the query result. The `refetchInterval: 30000` ensures the summary auto-refreshes every 30 seconds.

## 12. Frontend: TopSummaryBar — Replace hardcoded values with API data

- [ ] 12.1 Open `dispensapro/src/layouts/TopSummaryBar.tsx`. Replace the hardcoded `stats` array with data from the `useSummary` hook. Import `useSummary` from `./useSummary`. Inside the `TopSummaryBar` component, call `const { data, isLoading } = useSummary();`. Replace the 4 hardcoded values: `patientsWaiting` from `data?.patientsWaiting ?? 0`, `patientsServed` from `data?.patientsServed ?? 0`, `totalIncome` from `data?.totalIncome ?? 0`, `totalCharity` from `data?.totalCharity ?? 0`. When `isLoading` is true, display `"--"` for each value instead of the number. Keep the same visual structure (icons, labels, CSS classes) — only the values change.

## 13. Frontend: Verify build

- [ ] 13.1 Run `npm run build` from the `dispensapro/` directory to verify the frontend compiles without errors. Fix any TypeScript errors (missing imports, type mismatches) before considering the task complete.
