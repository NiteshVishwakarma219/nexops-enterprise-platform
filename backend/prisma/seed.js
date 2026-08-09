const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

async function createUser({
  email,
  password,
  fullName,
  role,
  employeeCode,
  designation,
}) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      role,
      isActive: true,
    },
    create: {
      email,
      password: hashedPassword,
      fullName,
      role,
      isActive: true,
    },
  });

  await prisma.employee.upsert({
    where: { userId: user.id },
    update: {
      employeeCode,
      designation,
      status: "active",
      dateOfJoining: new Date("2026-01-01"),
    },
    create: {
      userId: user.id,
      employeeCode,
      designation,
      dateOfJoining: new Date("2026-01-01"),
      status: "active",
    },
  });

  return user;
}

async function main() {
  console.log("Starting database seed...");

  await createUser({
    email: "admin@nexops.com",
    password: "Admin@123",
    fullName: "System Administrator",
    role: "admin",
    employeeCode: "EMP001",
    designation: "System Administrator",
  });

  await createUser({
    email: "hr@nexops.com",
    password: "HR@123",
    fullName: "HR Manager",
    role: "hr",
    employeeCode: "EMP002",
    designation: "HR Manager",
  });

  await createUser({
    email: "manager@nexops.com",
    password: "Manager@123",
    fullName: "Department Manager",
    role: "manager",
    employeeCode: "EMP003",
    designation: "Project Manager",
  });

  await createUser({
    email: "employee@nexops.com",
    password: "Employee@123",
    fullName: "Demo Employee",
    role: "employee",
    employeeCode: "EMP004",
    designation: "Software Engineer",
  });

  console.log("Database seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });