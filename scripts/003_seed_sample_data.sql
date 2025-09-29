-- Seed sample data for EHR system
-- This script adds sample patients, medical history, and other test data

-- Insert sample patients
INSERT INTO public.patients (medical_record_number, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact, insurance_info) VALUES
('MRN001234', 'John', 'Smith', '1985-03-15', 'male', '555-0123', 'john.smith@email.com', 
 '{"street": "123 Main St", "city": "Springfield", "state": "IL", "zip": "62701"}',
 '{"name": "Jane Smith", "relationship": "spouse", "phone": "555-0124"}',
 '{"provider": "Blue Cross", "policy_number": "BC123456", "group_number": "GRP789"}'),

('MRN001235', 'Sarah', 'Johnson', '1992-07-22', 'female', '555-0125', 'sarah.johnson@email.com',
 '{"street": "456 Oak Ave", "city": "Springfield", "state": "IL", "zip": "62702"}',
 '{"name": "Mike Johnson", "relationship": "husband", "phone": "555-0126"}',
 '{"provider": "Aetna", "policy_number": "AET789012", "group_number": "GRP456"}'),

('MRN001236', 'Robert', 'Davis', '1978-11-08', 'male', '555-0127', 'robert.davis@email.com',
 '{"street": "789 Pine St", "city": "Springfield", "state": "IL", "zip": "62703"}',
 '{"name": "Linda Davis", "relationship": "wife", "phone": "555-0128"}',
 '{"provider": "Cigna", "policy_number": "CIG345678", "group_number": "GRP123"}'),

('MRN001237', 'Emily', 'Wilson', '1995-01-30', 'female', '555-0129', 'emily.wilson@email.com',
 '{"street": "321 Elm St", "city": "Springfield", "state": "IL", "zip": "62704"}',
 '{"name": "Tom Wilson", "relationship": "father", "phone": "555-0130"}',
 '{"provider": "UnitedHealth", "policy_number": "UH901234", "group_number": "GRP567"}'),

('MRN001238', 'Michael', 'Brown', '1960-09-12', 'male', '555-0131', 'michael.brown@email.com',
 '{"street": "654 Maple Ave", "city": "Springfield", "state": "IL", "zip": "62705"}',
 '{"name": "Carol Brown", "relationship": "wife", "phone": "555-0132"}',
 '{"provider": "Humana", "policy_number": "HUM567890", "group_number": "GRP890"}');

-- Insert sample medical history
INSERT INTO public.medical_history (patient_id, condition_name, diagnosis_date, status, severity, notes) VALUES
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001234'), 'Hypertension', '2020-05-15', 'active', 'moderate', 'Well controlled with medication'),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001234'), 'Type 2 Diabetes', '2021-08-22', 'active', 'mild', 'Diet controlled, HbA1c 6.8%'),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001235'), 'Asthma', '2018-03-10', 'active', 'mild', 'Exercise-induced, uses rescue inhaler'),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001236'), 'Hyperlipidemia', '2019-11-05', 'active', 'moderate', 'On statin therapy'),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001237'), 'Anxiety Disorder', '2022-02-14', 'active', 'mild', 'Responds well to therapy'),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001238'), 'Coronary Artery Disease', '2015-07-20', 'chronic', 'moderate', 'Post-MI, on dual antiplatelet therapy');

-- Insert sample medications
INSERT INTO public.medications (patient_id, medication_name, dosage, frequency, start_date, status, notes) VALUES
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001234'), 'Lisinopril', '10mg', 'Once daily', '2020-05-15', 'active', 'For hypertension'),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001234'), 'Metformin', '500mg', 'Twice daily', '2021-08-22', 'active', 'For diabetes'),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001235'), 'Albuterol Inhaler', '90mcg', 'As needed', '2018-03-10', 'active', 'Rescue inhaler for asthma'),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001236'), 'Atorvastatin', '20mg', 'Once daily', '2019-11-05', 'active', 'For cholesterol'),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001237'), 'Sertraline', '50mg', 'Once daily', '2022-02-14', 'active', 'For anxiety'),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001238'), 'Aspirin', '81mg', 'Once daily', '2015-07-20', 'active', 'Cardioprotective'),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001238'), 'Clopidogrel', '75mg', 'Once daily', '2015-07-20', 'active', 'Antiplatelet therapy');

-- Insert sample vital signs
INSERT INTO public.vital_signs (patient_id, recorded_at, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height) VALUES
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001234'), NOW() - INTERVAL '1 day', 135, 85, 72, 98.6, 16, 98, 180.5, 70.0),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001235'), NOW() - INTERVAL '2 days', 118, 75, 68, 98.4, 18, 99, 125.0, 64.0),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001236'), NOW() - INTERVAL '3 days', 142, 88, 75, 98.8, 16, 97, 195.2, 72.0),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001237'), NOW() - INTERVAL '1 day', 110, 70, 65, 98.2, 14, 100, 115.8, 62.0),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001238'), NOW() - INTERVAL '2 days', 128, 78, 70, 98.5, 15, 98, 165.3, 68.0);

-- Insert sample patient alerts
INSERT INTO public.patient_alerts (patient_id, alert_type, priority, title, description) VALUES
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001234'), 'critical_value', 'high', 'Elevated Blood Pressure', 'Recent BP reading of 135/85 - monitor closely'),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001235'), 'allergy', 'critical', 'Penicillin Allergy', 'Patient has documented severe penicillin allergy - anaphylaxis risk'),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001236'), 'follow_up_needed', 'medium', 'Lipid Panel Due', 'Annual lipid panel due for statin monitoring'),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001237'), 'appointment_reminder', 'low', 'Therapy Session Tomorrow', 'Scheduled therapy session at 2:00 PM'),
((SELECT id FROM public.patients WHERE medical_record_number = 'MRN001238'), 'medication_interaction', 'high', 'Drug Interaction Alert', 'Potential interaction between current medications - review needed');
