# Doctor Consultation workspace

## critical

- [x] prescriptions api getting SQL error. could not execute statement [Unique index or primary key violation: \"PUBLIC.CONSTRAINT_INDEX_A ON PUBLIC.PRESCRIPTION(VISIT_ID NULLS FIRST) VALUES ( /* 1 */ CAST(X'e55e11be00294f0ab6d550f61c6494b4' AS BINARY(16)) )\"; SQL statement:\ninsert into prescription (created_at,doctor_id,patient_id,status,tenant_id,updated_at,visit_id,id) values (?,?,?,?,?,?,?,?) [23505-232]] [insert into prescription (created_at,doctor_id,patient_id,status,tenant_id,updated_at,visit_id,id) values (?,?,?,?,?,?,?,?)]; SQL [insert into prescription (created_at,doctor_id,patient_id,status,tenant_id,updated_at,visit_id,id) values (?,?,?,?,?,?,?,?)]; constraint [PUBLIC.CONSTRAINT_INDEX_A]"
- [x] POST /bills api getiing SQL error. {"error":"Something went wrong: could not execute statement [Unique index or primary key violation: \"PUBLIC.CONSTRAINT_INDEX_1 ON PUBLIC.BILL(PRESCRIPTION_ID NULLS FIRST) VALUES ( /* 3 */ CAST(X'767689bc60524af28270ba276582def3' AS BINARY(16)) )\"; SQL statement:\ninsert into bill (created_at,doctor_discount_pct,doctor_fee,doctor_fee_final,grand_total,medicine_total,medicine_total_final,patient_id,pharmacy_discount_pct,prescription_id,status,tenant_id,updated_at,id) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?) [23505-232]] [insert into bill (created_at,doctor_discount_pct,doctor_fee,doctor_fee_final,grand_total,medicine_total,medicine_total_final,patient_id,pharmacy_discount_pct,prescription_id,status,tenant_id,updated_at,id) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)]; SQL [insert into bill (created_at,doctor_discount_pct,doctor_fee,doctor_fee_final,grand_total,medicine_total,medicine_total_final,patient_id,pharmacy_discount_pct,prescription_id,status,tenant_id,updated_at,id) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)]; constraint [PUBLIC.CONSTRAINT_INDEX_1]"}


## high

- [] 

## medium

- [] 

## low

- [] 
