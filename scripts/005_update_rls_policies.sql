-- Drop existing RLS policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do anything to profiles" ON public.profiles;

DROP POLICY IF EXISTS "Healthcare providers can view patients" ON public.patients;
DROP POLICY IF EXISTS "Doctors and nurses can insert new patients" ON public.patients;
DROP POLICY IF EXISTS "Doctors can update patient records" ON public.patients;
DROP POLICY IF EXISTS "Admins can do anything on patients" ON public.patients;

DROP POLICY IF EXISTS "Healthcare providers can view medical history" ON public.medical_history;
DROP POLICY IF EXISTS "Doctors can insert new medical history" ON public.medical_history;
DROP POLICY IF EXISTS "Doctors can update medical history" ON public.medical_history;
DROP POLICY IF EXISTS "Admins can do anything on medical_history" ON public.medical_history;

DROP POLICY IF EXISTS "Healthcare providers can view medications" ON public.medications;
DROP POLICY IF EXISTS "Doctors can prescribe medications" ON public.medications;
DROP POLICY IF EXISTS "Doctors can update prescriptions" ON public.medications;
DROP POLICY IF EXISTS "Admins can do anything on medications" ON public.medications;

DROP POLICY IF EXISTS "Healthcare providers can view vital signs" ON public.vital_signs;
DROP POLICY IF EXISTS "Nurses and technicians can record vital signs" ON public.vital_signs;
DROP POLICY IF EXISTS "Nurses and technicians can update vital signs" ON public.vital_signs;
DROP POLICY IF EXISTS "Admins can do anything on vital_signs" ON public.vital_signs;

DROP POLICY IF EXISTS "Healthcare providers can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Doctors and nurses can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Doctors and nurses can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can do anything on appointments" ON public.appointments;

DROP POLICY IF EXISTS "Healthcare providers can view clinical notes" ON public.clinical_notes;
DROP POLICY IF EXISTS "Doctors and nurses can create clinical notes" ON public.clinical_notes;
DROP POLICY IF EXISTS "Doctors can update clinical notes" ON public.clinical_notes;
DROP POLICY IF EXISTS "Admins can do anything on clinical_notes" ON public.clinical_notes;

DROP POLICY IF EXISTS "Healthcare providers can view patient alerts" ON public.patient_alerts;
DROP POLICY IF EXISTS "Doctors and nurses can create patient alerts" ON public.patient_alerts;
DROP POLICY IF EXISTS "Doctors and nurses can update patient alerts" ON public.patient_alerts;
DROP POLICY IF EXISTS "Admins can do anything on patient_alerts" ON public.patient_alerts;


-- Helper function to get the role of the current user
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
BEGIN
  RETURN auth.jwt() ->> 'user_role';
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can do anything to profiles" ON public.profiles
  FOR ALL USING (get_my_role() = 'admin');

-- RLS Policies for patients
CREATE POLICY "Healthcare providers can view patients" ON public.patients
  FOR SELECT USING (get_my_role() IN ('admin', 'doctor', 'nurse', 'technician'));
CREATE POLICY "Doctors and nurses can insert new patients" ON public.patients
  FOR INSERT WITH CHECK (get_my_role() IN ('doctor', 'nurse'));
CREATE POLICY "Doctors can update patient records" ON public.patients
  FOR UPDATE USING (get_my_role() = 'doctor');
CREATE POLICY "Admins can do anything on patients" ON public.patients
  FOR ALL USING (get_my_role() = 'admin');

-- RLS Policies for medical_history
CREATE POLICY "Healthcare providers can view medical history" ON public.medical_history
  FOR SELECT USING (get_my_role() IN ('admin', 'doctor', 'nurse', 'technician'));
CREATE POLICY "Doctors can insert new medical history" ON public.medical_history
  FOR INSERT WITH CHECK (get_my_role() = 'doctor');
CREATE POLICY "Doctors can update medical history" ON public.medical_history
  FOR UPDATE USING (get_my_role() = 'doctor');
CREATE POLICY "Admins can do anything on medical_history" ON public.medical_history
  FOR ALL USING (get_my_role() = 'admin');

-- RLS Policies for medications
CREATE POLICY "Healthcare providers can view medications" ON public.medications
  FOR SELECT USING (get_my_role() IN ('admin', 'doctor', 'nurse', 'technician'));
CREATE POLICY "Doctors can prescribe medications" ON public.medications
  FOR INSERT WITH CHECK (get_my_role() = 'doctor');
CREATE POLICY "Doctors can update prescriptions" ON public.medications
  FOR UPDATE USING (get_my_role() = 'doctor');
CREATE POLICY "Admins can do anything on medications" ON public.medications
  FOR ALL USING (get_my_role() = 'admin');

-- RLS Policies for vital_signs
CREATE POLICY "Healthcare providers can view vital signs" ON public.vital_signs
  FOR SELECT USING (get_my_role() IN ('admin', 'doctor', 'nurse', 'technician'));
CREATE POLICY "Nurses and technicians can record vital signs" ON public.vital_signs
  FOR INSERT WITH CHECK (get_my_role() IN ('nurse', 'technician'));
CREATE POLICY "Nurses and technicians can update vital signs" ON public.vital_signs
  FOR UPDATE USING (get_my_role() IN ('nurse', 'technician'));
CREATE POLICY "Admins can do anything on vital_signs" ON public.vital_signs
  FOR ALL USING (get_my_role() = 'admin');

-- RLS Policies for appointments
CREATE POLICY "Healthcare providers can view appointments" ON public.appointments
  FOR SELECT USING (get_my_role() IN ('admin', 'doctor', 'nurse', 'technician'));
CREATE POLICY "Doctors and nurses can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (get_my_role() IN ('doctor', 'nurse'));
CREATE POLICY "Doctors and nurses can update appointments" ON public.appointments
  FOR UPDATE USING (get_my_role() IN ('doctor', 'nurse'));
CREATE POLICY "Admins can do anything on appointments" ON public.appointments
  FOR ALL USING (get_my_role() = 'admin');

-- RLS Policies for clinical_notes
CREATE POLICY "Healthcare providers can view clinical notes" ON public.clinical_notes
  FOR SELECT USING (get_my_role() IN ('admin', 'doctor', 'nurse', 'technician'));
CREATE POLICY "Doctors and nurses can create clinical notes" ON public.clinical_notes
  FOR INSERT WITH CHECK (get_my_role() IN ('doctor', 'nurse'));
CREATE POLICY "Doctors can update clinical notes" ON public.clinical_notes
  FOR UPDATE USING (get_my_role() = 'doctor');
CREATE POLICY "Admins can do anything on clinical_notes" ON public.clinical_notes
  FOR ALL USING (get_my_role() = 'admin');

-- RLS Policies for patient_alerts
CREATE POLICY "Healthcare providers can view patient alerts" ON public.patient_alerts
  FOR SELECT USING (get_my_role() IN ('admin', 'doctor', 'nurse', 'technician'));
CREATE POLICY "Doctors and nurses can create patient alerts" ON public.patient_alerts
  FOR INSERT WITH CHECK (get_my_role() IN ('doctor', 'nurse'));
CREATE POLICY "Doctors and nurses can update patient alerts" ON public.patient_alerts
  FOR UPDATE USING (get_my_role() IN ('doctor', 'nurse'));
CREATE POLICY "Admins can do anything on patient_alerts" ON public.patient_alerts
  FOR ALL USING (get_my_role() = 'admin');