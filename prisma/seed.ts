import { PrismaClient, Role, TaskStatus, AppointmentStatus, PatientStatus, RiskLevel, EncounterStatus, EncounterType } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clean up existing data
  console.log('Cleaning database...');
  await prisma.auditLog.deleteMany();
  await prisma.backgroundTask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.staffSchedule.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.procedure.deleteMany();
  await prisma.labResult.deleteMany();
  await prisma.allergy.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.vitalSign.deleteMany();
  await prisma.medicalHistory.deleteMany();
  await prisma.clinicalNote.deleteMany();
  await prisma.encounter.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.department.deleteMany();
  await prisma.profile.deleteMany();


  // 2. Create Departments
  console.log('Seeding departments...');
  const departments = await prisma.department.createManyAndReturn({
    data: [
      { name: 'Cardiology', description: 'Heart and vascular care' },
      { name: 'Neurology', description: 'Brain and nervous system care' },
      { name: 'Pediatrics', description: 'Child and adolescent care' },
      { name: 'Emergency', description: 'Emergency medical services' },
      { name: 'Orthopedics', description: 'Musculoskeletal system care' },
    ],
  });

  // 3. Create Profiles (Users) - Reduced to 10
  console.log('Seeding profiles...');
  const profiles = [];
  const roles = Object.values(Role);
  for (let i = 0; i < 10; i++) {
    const profile = await prisma.profile.create({
      data: {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: faker.helpers.arrayElement(roles),
      },
    });
    profiles.push(profile);
  }

  // 4. Create Patients - Reduced to 25
  console.log('Seeding patients...');
  const patients = [];
  const patientStatuses = Object.values(PatientStatus);
  const riskLevels = Object.values(RiskLevel);
  for (let i = 0; i < 25; i++) {
    const patient = await prisma.patient.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        dateOfBirth: faker.date.birthdate({ min: 18, max: 85, mode: 'age' }),
        gender: faker.person.gender(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        address: faker.location.streetAddress(),
        status: faker.helpers.arrayElement(patientStatuses),
        riskLevel: faker.helpers.arrayElement(riskLevels),
        primaryPhysicianId: faker.helpers.arrayElement(profiles.filter(p => p.role === 'PHYSICIAN')).id,
      },
    });
    patients.push(patient);
  }

  // 5. Create Appointments
  console.log('Seeding appointments...');
  const appointmentStatuses = Object.values(AppointmentStatus);
  for (const patient of patients) {
    const numAppointments = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < numAppointments; i++) {
      await prisma.appointment.create({
        data: {
          patientId: patient.id,
          providerId: faker.helpers.arrayElement(profiles.filter(p => p.role === 'PHYSICIAN' || p.role === 'SPECIALIST')).id,
          appointmentDateTime: faker.date.future(),
          durationMinutes: faker.helpers.arrayElement([15, 30, 45, 60]),
          reason: faker.lorem.sentence(),
          status: faker.helpers.arrayElement(appointmentStatuses),
        },
      });
    }
  }

  // 6. Create Medical History for some patients - Reduced to 15
  console.log('Seeding medical histories...');
  for (const patient of faker.helpers.arrayElements(patients, 15)) {
     const numHistory = faker.number.int({ min: 1, max: 3 });
     for (let i = 0; i < numHistory; i++) {
        await prisma.medicalHistory.create({
            data: {
                patientId: patient.id,
                diagnosis: faker.lorem.words(3),
                diagnosisDate: faker.date.past(),
                treatment: faker.lorem.sentence(),
            }
        });
     }
  }

  // 7. Create Encounters - Reduced to 15
  console.log('Seeding encounters...');
  const encounterStatuses = Object.values(EncounterStatus);
  const encounterTypes = Object.values(EncounterType);
  for (const patient of faker.helpers.arrayElements(patients, 15)) {
    const encounter = await prisma.encounter.create({
      data: {
        patientId: patient.id,
        providerId: faker.helpers.arrayElement(profiles.filter(p => p.role === 'PHYSICIAN')).id,
        departmentId: faker.helpers.arrayElement(departments).id,
        status: faker.helpers.arrayElement(encounterStatuses),
        type: faker.helpers.arrayElement(encounterTypes),
        reason: faker.lorem.sentence(),
        startTime: faker.date.past(),
      },
    });

    // Create a clinical note for the encounter
    await prisma.clinicalNote.create({
        data: {
            patientId: patient.id,
            authorId: encounter.providerId,
            encounterId: encounter.id,
            title: `Encounter Note: ${faker.lorem.words(3)}`,
            content: faker.lorem.paragraphs(3),
            noteType: "EncounterSummary"
        }
    });
  }

  // 8. Create Tasks - Reduced to 5 per profile
  console.log('Seeding tasks...');
  const taskStatuses = Object.values(TaskStatus);
  for (const profile of profiles) {
    const numTasks = faker.number.int({ min: 0, max: 5 });
    for (let i = 0; i < numTasks; i++) {
      await prisma.task.create({
        data: {
          assigneeId: profile.id,
          title: faker.lorem.sentence(4),
          description: faker.lorem.paragraph(),
          status: faker.helpers.arrayElement(taskStatuses),
          dueDate: faker.date.future(),
        },
      });
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });