# Doctor Consultation workspace

## critical

- [x] prescriptions api getting SQL error. could not execute statement [Unique index or primary key violation: \"PUBLIC.CONSTRAINT_INDEX_A ON PUBLIC.PRESCRIPTION(VISIT_ID NULLS FIRST) VALUES ( /* 1 */ CAST(X'e55e11be00294f0ab6d550f61c6494b4' AS BINARY(16)) )\"; SQL statement:\ninsert into prescription (created_at,doctor_id,patient_id,status,tenant_id,updated_at,visit_id,id) values (?,?,?,?,?,?,?,?) [23505-232]] [insert into prescription (created_at,doctor_id,patient_id,status,tenant_id,updated_at,visit_id,id) values (?,?,?,?,?,?,?,?)]; SQL [insert into prescription (created_at,doctor_id,patient_id,status,tenant_id,updated_at,visit_id,id) values (?,?,?,?,?,?,?,?)]; constraint [PUBLIC.CONSTRAINT_INDEX_A]" - fix : add DESC by visit date logic for repository function - why : to get the latest prescription for a visit. unless we add this, it will always return the a random visit instead of the latest visit.

- [x] 


## high

- [] 

## medium

- [] 

## low

- [x] visit Notes not displying in the patient visits section


Scenarios to check :
- [] 
- [] edge case 1 : what if the patient not arrived? is it handled? how to handle 
- 