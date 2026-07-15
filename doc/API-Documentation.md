# Doctor Dispensary Application API Documentation

## Overview

This document describes the REST API endpoints for the Doctor Dispensary Application. The application is a multi-tenant system that manages patient visits, prescriptions, medicine dispensing, billing, and inventory management.

### Base URL
```
http://localhost:8080
```

### Authentication
All endpoints (except tenant management) require tenant context and user authentication. The system uses multi-tenant architecture with tenant isolation.

### Common Headers
- `Content-Type: application/json`
- `X-Tenant-ID: {tenant-uuid}` (for tenant context)

---

## Bill Management API

### Create Bill
**POST** `/bills`

Creates a new bill for a visit.

**Request Body:**
```json
{
  "visitId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```
201 Created
Location: /bills/{billId}
```
```json
"550e8400-e29b-41d4-a716-446655440000"
```

**Status Codes:**
- `201` - Bill created successfully
- `400` - Invalid request data
- `404` - Visit not found

---

### Get Bill
**GET** `/bills/{id}`

Retrieves bill details by ID.

**Path Parameters:**
- `id` (UUID) - Bill ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "visitId": "550e8400-e29b-41d4-a716-446655440001",
  "patientId": "550e8400-e29b-41d4-a716-446655440002",
  "doctorFee": 1500.00,
  "doctorDiscountPct": 0,
  "doctorFeeFinal": 1500.00,
  "medicineTotal": 2500.00,
  "pharmacyDiscountPct": 10,
  "medicineTotalFinal": 2250.00,
  "grandTotal": 3750.00,
  "status": "DUE",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "lineItems": []
}
```

**Status Codes:**
- `200` - Bill retrieved successfully
- `404` - Bill not found

---

### Calculate Bill
**POST** `/bills/{id}/calculate`

Calculates bill totals including doctor fees and medicine costs.

**Path Parameters:**
- `id` (UUID) - Bill ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "visitId": "550e8400-e29b-41d4-a716-446655440001",
  "patientId": "550e8400-e29b-41d4-a716-446655440002",
  "doctorFee": 1500.00,
  "doctorDiscountPct": 0,
  "doctorFeeFinal": 1500.00,
  "medicineTotal": 2500.00,
  "pharmacyDiscountPct": 10,
  "medicineTotalFinal": 2250.00,
  "grandTotal": 3750.00,
  "status": "DUE",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:35:00",
  "lineItems": []
}
```

**Status Codes:**
- `200` - Bill calculated successfully
- `404` - Bill not found

---

### Update Bill Discounts
**PUT** `/bills/{id}/discounts`

Updates discount percentages for doctor fees and pharmacy items.

**Path Parameters:**
- `id` (UUID) - Bill ID

**Request Body:**
```json
{
  "doctorDiscountPct": 10,
  "pharmacyDiscountPct": 15
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "visitId": "550e8400-e29b-41d4-a716-446655440001",
  "patientId": "550e8400-e29b-41d4-a716-446655440002",
  "doctorFee": 1500.00,
  "doctorDiscountPct": 10,
  "doctorFeeFinal": 1350.00,
  "medicineTotal": 2500.00,
  "pharmacyDiscountPct": 15,
  "medicineTotalFinal": 2125.00,
  "grandTotal": 3475.00,
  "status": "DUE",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:40:00",
  "lineItems": []
}
```

**Status Codes:**
- `200` - Discounts updated successfully
- `404` - Bill not found
- `400` - Invalid discount values

---

### Update Bill Status
**PUT** `/bills/{id}/status`

Updates the payment status of a bill.

**Path Parameters:**
- `id` (UUID) - Bill ID

**Request Body:**
```json
{
  "status": "PAID"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "visitId": "550e8400-e29b-41d4-a716-446655440001",
  "patientId": "550e8400-e29b-41d4-a716-446655440002",
  "doctorFee": 1500.00,
  "doctorDiscountPct": 10,
  "doctorFeeFinal": 1350.00,
  "medicineTotal": 2500.00,
  "pharmacyDiscountPct": 15,
  "medicineTotalFinal": 2125.00,
  "grandTotal": 3475.00,
  "status": "PAID",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:45:00",
  "lineItems": []
}
```

**Status Codes:**
- `200` - Status updated successfully
- `404` - Bill not found
- `400` - Invalid status value

---

### List Bills by Patient
**GET** `/bills`

Lists bills for a specific patient or retrieves a bill by prescription ID.

**Query Parameters:**
- `patientId` (UUID, optional) - Patient ID to filter bills
- `prescriptionId` (UUID, optional) - Prescription ID to lookup specific bill

**Response (when patientId provided):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "visitId": "550e8400-e29b-41d4-a716-446655440001",
    "patientId": "550e8400-e29b-41d4-a716-446655440002",
    "doctorFee": 1500.00,
    "doctorDiscountPct": 10,
    "doctorFeeFinal": 1350.00,
    "medicineTotal": 2500.00,
    "pharmacyDiscountPct": 15,
    "medicineTotalFinal": 2125.00,
    "grandTotal": 3475.00,
    "status": "PAID",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:45:00",
    "lineItems": []
  }
]
```

**Response (when prescriptionId provided):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "visitId": "550e8400-e29b-41d4-a716-446655440001",
  "patientId": "550e8400-e29b-41d4-a716-446655440002",
  "doctorFee": 1500.00,
  "doctorDiscountPct": 10,
  "doctorFeeFinal": 1350.00,
  "medicineTotal": 2500.00,
  "pharmacyDiscountPct": 15,
  "medicineTotalFinal": 2125.00,
  "grandTotal": 3475.00,
  "status": "PAID",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:45:00",
  "lineItems": []
}
```

**Status Codes:**
- `200` - Bills retrieved successfully
- `404` - Bill not found (when using prescriptionId)

---

## Dispense Management API

### Record Dispense
**POST** `/dispense`

Records medicine dispensing for a prescription.

**Request Body:**
```json
{
  "prescriptionItemId": "550e8400-e29b-41d4-a716-446655440000",
  "quantityDispensed": 10,
  "batchNumber": "BATCH001",
  "expiryDate": "2025-12-31",
  "notes": "Patient instructed to take with food"
}
```

**Response:**
```
201 Created
Location: /dispense/{dispenseId}
```
```json
"550e8400-e29b-41d4-a716-446655440000"
```

**Status Codes:**
- `201` - Dispense recorded successfully
- `400` - Invalid request data
- `404` - Prescription item not found

---

### Get Dispense
**GET** `/dispense/{id}`

Retrieves dispense details by ID.

**Path Parameters:**
- `id` (UUID) - Dispense ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "prescriptionItemId": "550e8400-e29b-41d4-a716-446655440001",
  "quantityDispensed": 10,
  "batchNumber": "BATCH001",
  "expiryDate": "2025-12-31",
  "notes": "Patient instructed to take with food",
  "dispensedAt": "2024-01-15T11:00:00",
  "dispensedBy": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Status Codes:**
- `200` - Dispense retrieved successfully
- `404` - Dispense not found

---

## Distributor Management API

### Create Distributor
**POST** `/distributors`

Creates a new medicine distributor.

**Request Body:**
```json
{
  "name": "MediSupply Ltd",
  "contactPerson": "John Smith",
  "phone": "+94771234567",
  "email": "info@medisupply.com",
  "address": "123 Main St, Colombo"
}
```

**Response:**
```
201 Created
Location: /distributors/{distributorId}
```
```json
"550e8400-e29b-41d4-a716-446655440000"
```

**Status Codes:**
- `201` - Distributor created successfully
- `400` - Invalid request data

---

### List Distributors
**GET** `/distributors`

Retrieves all distributors for the tenant.

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "MediSupply Ltd",
    "contactPerson": "John Smith",
    "phone": "+94771234567",
    "email": "info@medisupply.com",
    "address": "123 Main St, Colombo",
    "createdAt": "2024-01-15T09:00:00",
    "updatedAt": "2024-01-15T09:00:00"
  }
]
```

**Status Codes:**
- `200` - Distributors retrieved successfully

---

## Medicine Management API

### Add Medicine
**POST** `/medicines`

Adds a new medicine to the inventory.

**Request Body:**
```json
{
  "name": "Paracetamol",
  "form": "Tablet",
  "strength": "500mg",
  "unitOfMeasurement": "tablet",
  "sellPrice": 5.50,
  "reorderLevel": 100,
  "quantity": 500
}
```

**Response:**
```
201 Created
Location: /medicines/{medicineId}
```
```json
"550e8400-e29b-41d4-a716-446655440000"
```

**Status Codes:**
- `201` - Medicine added successfully
- `400` - Invalid request data

---

### List Medicines
**GET** `/medicines`

Retrieves all medicines in the inventory.

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Paracetamol",
    "form": "Tablet",
    "strength": "500mg",
    "unitOfMeasurement": "tablet",
    "sellPrice": 5.50,
    "reorderLevel": 100,
    "quantity": 500,
    "createdAt": "2024-01-15T09:00:00",
    "updatedAt": "2024-01-15T09:00:00"
  }
]
```

**Status Codes:**
- `200` - Medicines retrieved successfully

---

## Patient Management API

### Create Patient
**POST** `/patients`

Creates a new patient record.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-05-15",
  "gender": "Male",
  "contact": "+94771234567",
  "address": "123 Main St, Colombo",
  "createdById": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```
201 Created
Location: /patients/{patientId}
```
```json
"PAT-2024-001"
```

**Status Codes:**
- `201` - Patient created successfully
- `400` - Invalid request data

---

### Get Patient
**GET** `/patients/{id}`

Retrieves patient details by ID.

**Path Parameters:**
- `id` (UUID) - Patient ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-05-15",
  "age": "33 years",
  "gender": "Male",
  "contact": "+94771234567",
  "address": "123 Main St, Colombo",
  "createdAt": "2024-01-15T09:00:00",
  "updatedAt": "2024-01-15T09:00:00",
  "createdById": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Status Codes:**
- `200` - Patient retrieved successfully
- `404` - Patient not found

---

### Update Patient
**PUT** `/patients/{id}`

Updates patient information.

**Path Parameters:**
- `id` (UUID) - Patient ID

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-05-15",
  "gender": "Male",
  "contact": "+94771234568",
  "address": "456 New Ave, Colombo",
  "createdById": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-05-15",
  "age": "33 years",
  "gender": "Male",
  "contact": "+94771234568",
  "address": "456 New Ave, Colombo",
  "createdAt": "2024-01-15T09:00:00",
  "updatedAt": "2024-01-15T10:00:00",
  "createdById": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Status Codes:**
- `200` - Patient updated successfully
- `404` - Patient not found
- `400` - Invalid request data

---

### Search Patients
**GET** `/patients`

Searches patients by name or contact number.

**Query Parameters:**
- `search` (String, required) - Search term (name or contact)

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "dob": "1990-05-15",
    "age": "33 years",
    "gender": "Male",
    "contact": "+94771234567",
    "address": "123 Main St, Colombo",
    "createdAt": "2024-01-15T09:00:00",
    "updatedAt": "2024-01-15T09:00:00",
    "createdById": "550e8400-e29b-41d4-a716-446655440001"
  }
]
```

**Status Codes:**
- `200` - Patients retrieved successfully

---

## Prescription Management API

### Create Prescription
**POST** `/prescriptions`

Creates a new prescription for a visit.

**Request Body:**
```json
{
  "visitId": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response:**
```json
"550e8400-e29b-41d4-a716-446655440000"
```

**Status Codes:**
- `200` - Prescription created successfully
- `404` - Visit or patient not found
- `400` - Invalid request data

---

### Get Prescription
**GET** `/prescriptions/{id}`

Retrieves prescription details by ID.

**Path Parameters:**
- `id` (UUID) - Prescription ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "visitId": "550e8400-e29b-41d4-a716-446655440001",
  "patientId": "550e8400-e29b-41d4-a716-446655440002",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:00:00",
  "updatedAt": "2024-01-15T10:00:00",
  "items": []
}
```

**Status Codes:**
- `200` - Prescription retrieved successfully
- `404` - Prescription not found

---

### Add Prescription Item
**POST** `/prescriptions/{id}/items`

Adds a medicine item to a prescription.

**Path Parameters:**
- `id` (UUID) - Prescription ID

**Request Body:**
```json
{
  "medicineId": "550e8400-e29b-41d4-a716-446655440000",
  "dosage": "1 tablet",
  "frequency": "twice daily",
  "duration": "7 days",
  "instructions": "Take after meals",
  "quantity": 14
}
```

**Response:**
```json
"550e8400-e29b-41d4-a716-446655440000"
```

**Status Codes:**
- `200` - Prescription item added successfully
- `404` - Prescription or medicine not found
- `400` - Invalid request data

---

### Get Prescription Items
**GET** `/prescriptions/{id}/items`

Retrieves all items in a prescription.

**Path Parameters:**
- `id` (UUID) - Prescription ID

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "prescriptionId": "550e8400-e29b-41d4-a716-446655440001",
    "medicineId": "550e8400-e29b-41d4-a716-446655440002",
    "medicineName": "Paracetamol",
    "dosage": "1 tablet",
    "frequency": "twice daily",
    "duration": "7 days",
    "instructions": "Take after meals",
    "quantity": 14,
    "createdAt": "2024-01-15T10:00:00"
  }
]
```

**Status Codes:**
- `200` - Prescription items retrieved successfully
- `404` - Prescription not found

---

### Update Prescription Status
**PUT** `/prescriptions/{id}/status`

Updates the status of a prescription.

**Path Parameters:**
- `id` (UUID) - Prescription ID

**Request Body:**
```json
{
  "status": "DISPENSED"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "visitId": "550e8400-e29b-41d4-a716-446655440001",
  "patientId": "550e8400-e29b-41d4-a716-446655440002",
  "status": "DISPENSED",
  "createdAt": "2024-01-15T10:00:00",
  "updatedAt": "2024-01-15T11:00:00",
  "items": []
}
```

**Status Codes:**
- `200` - Status updated successfully
- `404` - Prescription not found
- `400` - Invalid status value

---

### Get Prescription by VisitId
**GET** `/prescriptions`

Retrieves prescription details by visit ID.

**Query Parameters:**
- `visitId` (UUID, required) - Visit ID to lookup prescription

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "visitId": "550e8400-e29b-41d4-a716-446655440001",
  "patientId": "550e8400-e29b-41d4-a716-446655440002",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:00:00",
  "updatedAt": "2024-01-15T10:00:00",
  "items": []
}
```

**Status Codes:**
- `200` - Prescription retrieved successfully
- `404` - Prescription not found

---

## Queue Management API

### Create Queue Entry
**POST** `/queue`

Adds a patient to the consultation queue.

**Request Body:**
```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "doctorId": "550e8400-e29b-41d4-a716-446655440001",
  "visitType": "CONSULTATION",
  "priority": "NORMAL"
}
```

**Response:**
```
201 Created
Location: /queue/{queueId}
```
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "doctorId": "550e8400-e29b-41d4-a716-446655440002",
  "visitType": "CONSULTATION",
  "priority": "NORMAL",
  "status": "WAITING",
  "queueNumber": 1,
  "createdAt": "2024-01-15T09:00:00",
  "updatedAt": "2024-01-15T09:00:00"
}
```

**Status Codes:**
- `201` - Queue entry created successfully
- `400` - Invalid request data

---

### Check-in Patient
**PATCH** `/queue/{id}/check-in`

Marks a patient as checked-in for consultation.

**Path Parameters:**
- `id` (UUID) - Queue entry ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "doctorId": "550e8400-e29b-41d4-a716-446655440002",
  "visitType": "CONSULTATION",
  "priority": "NORMAL",
  "status": "CHECKED_IN",
  "queueNumber": 1,
  "createdAt": "2024-01-15T09:00:00",
  "updatedAt": "2024-01-15T09:15:00"
}
```

**Status Codes:**
- `200` - Patient checked-in successfully
- `404` - Queue entry not found

---

### Start Consultation
**PATCH** `/queue/{id}/start`

Marks consultation as started for a patient.

**Path Parameters:**
- `id` (UUID) - Queue entry ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "doctorId": "550e8400-e29b-41d4-a716-446655440002",
  "visitType": "CONSULTATION",
  "priority": "NORMAL",
  "status": "IN_PROGRESS",
  "queueNumber": 1,
  "createdAt": "2024-01-15T09:00:00",
  "updatedAt": "2024-01-15T09:30:00"
}
```

**Status Codes:**
- `200` - Consultation started successfully
- `404` - Queue entry not found

---

### Complete Consultation
**PATCH** `/queue/{id}/serve`

Marks consultation as completed for a patient.

**Path Parameters:**
- `id` (UUID) - Queue entry ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "doctorId": "550e8400-e29b-41d4-a716-446655440002",
  "visitType": "CONSULTATION",
  "priority": "NORMAL",
  "status": "COMPLETED",
  "queueNumber": 1,
  "createdAt": "2024-01-15T09:00:00",
  "updatedAt": "2024-01-15T10:00:00"
}
```

**Status Codes:**
- `200` - Consultation completed successfully
- `404` - Queue entry not found

---

### Mark No Show
**PATCH** `/queue/{id}/no-show`

Marks a patient as no-show for their appointment.

**Path Parameters:**
- `id` (UUID) - Queue entry ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "doctorId": "550e8400-e29b-41d4-a716-446655440002",
  "visitType": "CONSULTATION",
  "priority": "NORMAL",
  "status": "NO_SHOW",
  "queueNumber": 1,
  "createdAt": "2024-01-15T09:00:00",
  "updatedAt": "2024-01-15T09:45:00"
}
```

**Status Codes:**
- `200` - Patient marked as no-show successfully
- `404` - Queue entry not found

---

### Remove from Queue
**PATCH** `/queue/{id}/remove`

Removes a patient from the queue.

**Path Parameters:**
- `id` (UUID) - Queue entry ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "doctorId": "550e8400-e29b-41d4-a716-446655440002",
  "visitType": "CONSULTATION",
  "priority": "NORMAL",
  "status": "REMOVED",
  "queueNumber": 1,
  "createdAt": "2024-01-15T09:00:00",
  "updatedAt": "2024-01-15T09:20:00"
}
```

**Status Codes:**
- `200` - Patient removed from queue successfully
- `404` - Queue entry not found

---

### Get Doctor Queue
**GET** `/queue`

Retrieves the current queue for a specific doctor.

**Query Parameters:**
- `doctorId` (String, required) - Doctor ID

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "doctorId": "550e8400-e29b-41d4-a716-446655440002",
    "visitType": "CONSULTATION",
    "priority": "NORMAL",
    "status": "WAITING",
    "queueNumber": 1,
    "createdAt": "2024-01-15T09:00:00",
    "updatedAt": "2024-01-15T09:00:00"
  }
]
```

**Status Codes:**
- `200` - Doctor queue retrieved successfully

---

## Supply Management API

### Create Supply
**POST** `/supplies`

Creates a new medicine supply record.

**Request Body:**
```json
{
  "distributorId": "550e8400-e29b-41d4-a716-446655440000",
  "invoiceNumber": "INV-2024-001",
  "supplyDate": "2024-01-15",
  "notes": "Regular monthly supply"
}
```

**Response:**
```
201 Created
Location: /supplies/{supplyId}
```
```json
"550e8400-e29b-41d4-a716-446655440000"
```

**Status Codes:**
- `201` - Supply created successfully
- `400` - Invalid request data

---

### Add Stock Batches
**POST** `/supplies/{supplyId}/stock-batches`

Adds stock batches to a supply record.

**Path Parameters:**
- `supplyId` (UUID) - Supply ID

**Request Body:**
```json
[
  {
    "medicineId": "550e8400-e29b-41d4-a716-446655440000",
    "batchNumber": "BATCH001",
    "expiryDate": "2025-12-31",
    "quantity": 100,
    "unitCost": 3.50
  }
]
```

**Response:**
```json
[
  "550e8400-e29b-41d4-a716-446655440000"
]
```

**Status Codes:**
- `200` - Stock batches added successfully
- `404` - Supply not found
- `400` - Invalid request data

---

### Get Supply
**GET** `/supplies/{id}`

Retrieves supply details by ID.

**Path Parameters:**
- `id` (UUID) - Supply ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "distributorId": "550e8400-e29b-41d4-a716-446655440001",
  "distributorName": "MediSupply Ltd",
  "invoiceNumber": "INV-2024-001",
  "supplyDate": "2024-01-15",
  "notes": "Regular monthly supply",
  "createdAt": "2024-01-15T08:00:00",
  "updatedAt": "2024-01-15T08:00:00",
  "stockBatches": []
}
```

**Status Codes:**
- `200` - Supply retrieved successfully
- `404` - Supply not found

---

### List Supplies
**GET** `/supplies`

Lists supplies with optional distributor filtering.

**Query Parameters:**
- `distributorId` (UUID, optional) - Filter by distributor

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "distributorId": "550e8400-e29b-41d4-a716-446655440001",
    "distributorName": "MediSupply Ltd",
    "invoiceNumber": "INV-2024-001",
    "supplyDate": "2024-01-15",
    "notes": "Regular monthly supply",
    "createdAt": "2024-01-15T08:00:00",
    "updatedAt": "2024-01-15T08:00:00",
    "stockBatches": []
  }
]
```

**Status Codes:**
- `200` - Supplies retrieved successfully

---

## Tenant Management API

### Create Tenant
**POST** `/tenants`

Creates a new tenant (multi-tenant system setup).

**Query Parameters:**
- `name` (String, required) - Tenant name
- `code` (String, required) - Tenant code

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "City Hospital",
  "code": "CITY-HOSP-001",
  "createdAt": "2024-01-15T08:00:00",
  "updatedAt": "2024-01-15T08:00:00"
}
```

**Status Codes:**
- `200` - Tenant created successfully
- `400` - Invalid request data

---

### List Tenants
**GET** `/tenants`

Retrieves all tenants in the system.

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "City Hospital",
    "code": "CITY-HOSP-001",
    "createdAt": "2024-01-15T08:00:00",
    "updatedAt": "2024-01-15T08:00:00"
  }
]
```

**Status Codes:**
- `200` - Tenants retrieved successfully

---

## User Management API

### Create User
**POST** `/users`

Creates a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john.doe@hospital.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "DOCTOR",
  "phone": "+94771234567"
}
```

**Response:**
```
201 Created
Location: /users/{userId}
```
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "john.doe@hospital.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "DOCTOR",
  "phone": "+94771234567",
  "createdAt": "2024-01-15T08:00:00",
  "updatedAt": "2024-01-15T08:00:00"
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - Invalid request data

---

### Get User
**GET** `/users/{id}`

Retrieves user details by ID.

**Path Parameters:**
- `id` (UUID) - User ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "john.doe@hospital.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "DOCTOR",
  "phone": "+94771234567",
  "createdAt": "2024-01-15T08:00:00",
  "updatedAt": "2024-01-15T08:00:00"
}
```

**Status Codes:**
- `200` - User retrieved successfully
- `404` - User not found

---

### Update User
**PUT** `/users/{id}`

Updates user information.

**Path Parameters:**
- `id` (UUID) - User ID

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john.doe@hospital.com",
  "firstName": "John",
  "lastName": "Smith",
  "role": "DOCTOR",
  "phone": "+94771234568"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "john.doe@hospital.com",
  "firstName": "John",
  "lastName": "Smith",
  "role": "DOCTOR",
  "phone": "+94771234568",
  "createdAt": "2024-01-15T08:00:00",
  "updatedAt": "2024-01-15T09:00:00"
}
```

**Status Codes:**
- `200` - User updated successfully
- `404` - User not found
- `400` - Invalid request data

---

### List Users
**GET** `/users`

Retrieves all users with optional role filtering.

**Query Parameters:**
- `roles` (Array, optional) - Filter by user roles

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john.doe@hospital.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "DOCTOR",
    "phone": "+94771234567",
    "createdAt": "2024-01-15T08:00:00",
    "updatedAt": "2024-01-15T08:00:00"
  }
]
```

**Status Codes:**
- `200` - Users retrieved successfully

---

## Visit Management API

### Create Visit
**POST** `/visits`

Creates a new patient visit record.

**Request Body:**
```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "doctorId": "550e8400-e29b-41d4-a716-446655440001",
  "visitType": "CONSULTATION",
  "chiefComplaint": "Headache and fever",
  "notes": "Patient reports symptoms for 3 days"
}
```

**Response:**
```
201 Created
Location: /visits/{visitId}
```
```json
"VISIT-2024-001"
```

**Status Codes:**
- `201` - Visit created successfully
- `400` - Invalid request data

---

### Get Visit
**GET** `/visits/{id}`

Retrieves visit details by ID.

**Path Parameters:**
- `id` (UUID) - Visit ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "doctorId": "550e8400-e29b-41d4-a716-446655440002",
  "visitType": "CONSULTATION",
  "status": "ACTIVE",
  "chiefComplaint": "Headache and fever",
  "notes": "Patient reports symptoms for 3 days",
  "createdAt": "2024-01-15T10:00:00",
  "updatedAt": "2024-01-15T10:00:00"
}
```

**Status Codes:**
- `200` - Visit retrieved successfully
- `404` - Visit not found

---

### Update Visit Status
**PUT** `/visits/{id}/status`

Updates the status of a visit.

**Path Parameters:**
- `id` (UUID) - Visit ID

**Query Parameters:**
- `status` (String, required) - New status value

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "doctorId": "550e8400-e29b-41d4-a716-446655440002",
  "visitType": "CONSULTATION",
  "status": "COMPLETED",
  "chiefComplaint": "Headache and fever",
  "notes": "Patient reports symptoms for 3 days",
  "createdAt": "2024-01-15T10:00:00",
  "updatedAt": "2024-01-15T11:00:00"
}
```

**Status Codes:**
- `200` - Status updated successfully
- `404` - Visit not found
- `400` - Invalid status value

---

### List Visits
**GET** `/visits`

Lists visits with optional patient filtering.

**Query Parameters:**
- `patientId` (UUID, optional) - Filter by patient

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "doctorId": "550e8400-e29b-41d4-a716-446655440002",
    "visitType": "CONSULTATION",
    "status": "COMPLETED",
    "chiefComplaint": "Headache and fever",
    "notes": "Patient reports symptoms for 3 days",
    "createdAt": "2024-01-15T10:00:00",
    "updatedAt": "2024-01-15T11:00:00"
  }
]
```

**Status Codes:**
- `200` - Visits retrieved successfully

---

## Visit Notes API

### Add Visit Note
**POST** `/visits/{visitId}/notes`

Adds a clinical note to a visit.

**Path Parameters:**
- `visitId` (UUID) - Visit ID

**Request Body:**
```json
{
  "note": "Patient prescribed paracetamol for fever. Advised rest and hydration."
}
```

**Response:**
```json
"550e8400-e29b-41d4-a716-446655440000"
```

**Status Codes:**
- `200` - Note added successfully
- `404` - Visit not found
- `400` - Invalid request data

---

### Get Visit Notes
**GET** `/visits/{visitId}/notes`

Retrieves all notes for a visit.

**Path Parameters:**
- `visitId` (UUID) - Visit ID

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "visitId": "550e8400-e29b-41d4-a716-446655440001",
    "note": "Patient prescribed paracetamol for fever. Advised rest and hydration.",
    "createdBy": "550e8400-e29b-41d4-a716-446655440002",
    "createdAt": "2024-01-15T10:30:00"
  }
]
```

**Status Codes:**
- `200` - Visit notes retrieved successfully
- `404` - Visit not found

---

## Common Error Responses

### 400 Bad Request
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for object 'request'. Field 'name' must not be blank.",
  "path": "/patients"
}
```

### 404 Not Found
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Patient not found with id: 550e8400-e29b-41d4-a716-446655440000",
  "path": "/patients/550e8400-e29b-41d4-a716-446655440000"
}
```

### 500 Internal Server Error
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Unexpected error occurred while processing request",
  "path": "/patients"
}
```

---

## Data Types and Formats

### UUID Format
All UUID fields follow the standard format: `550e8400-e29b-41d4-a716-446655440000`

### Date/Time Formats
- **Date**: `YYYY-MM-DD` (e.g., `2024-01-15`)
- **Date/Time**: `YYYY-MM-DDTHH:mm:ss` (e.g., `2024-01-15T10:30:00`)

### Phone Number Format
Sri Lankan phone numbers in formats:
- `+94XXXXXXXXX` (international format)
- `0XXXXXXXXX` (local format)

### Currency
All monetary values use decimal format with 2 decimal places (e.g., `1500.00`)

---

## Status Values

### Bill Status
- `DUE` - Payment pending
- `PAID` - Payment completed
- `VOID` - Bill cancelled

### Prescription Status
- `ACTIVE` - Prescription is active
- `DISPENSED` - Medicines dispensed
- `CANCELLED` - Prescription cancelled

### Queue Status
- `WAITING` - Patient in queue
- `CHECKED_IN` - Patient arrived
- `IN_PROGRESS` - Consultation in progress
- `COMPLETED` - Consultation completed
- `NO_SHOW` - Patient missed appointment
- `REMOVED` - Removed from queue

### Visit Status
- `ACTIVE` - Visit in progress
- `COMPLETED` - Visit completed
- `CANCELLED` - Visit cancelled

### User Roles
- `ADMIN` - System administrator
- `DOCTOR` - Medical practitioner
- `PHARMACIST` - Pharmacy staff
- `RECEPTIONIST` - Front desk staff

---

## Authentication and Authorization

### Tenant Context
All API calls (except tenant management) require tenant context to be established. This is typically handled through:
- HTTP Header: `X-Tenant-ID: {tenant-uuid}`
- Or through JWT token containing tenant information

### User Authentication
Users must be authenticated to access the API. Authentication is typically handled through:
- JWT Bearer tokens in `Authorization` header
- Session-based authentication

### Role-Based Access Control
Different endpoints may require specific user roles:
- **Admin**: Full access to all endpoints
- **Doctor**: Access to patient, visit, prescription, and queue management
- **Pharmacist**: Access to medicine, dispensing, and supply management
- **Receptionist**: Access to patient registration and queue management

---

## Rate Limiting

API endpoints may be subject to rate limiting to prevent abuse:
- Standard limit: 1000 requests per hour per tenant
- Burst limit: 100 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## Version Information

Current API version: **v1**

Version information is included in response headers:
- `API-Version: 1.0`

---

*Last updated: January 15, 2024*
