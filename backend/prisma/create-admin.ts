import { PrismaClient, UserStatus } from '@prisma/client';

import { ADMIN_USER_ROLES, isAdminUserRole } from '../src/auth/constants/auth.constants';
import { PasswordService } from '../src/auth/password.service';

type AdminRole = (typeof ADMIN_USER_ROLES)[number];

export type CreateAdminInput = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  role?: AdminRole;
  status?: UserStatus;
};

const DEFAULT_ADMIN: Required<Omit<CreateAdminInput, 'phone'>> & { phone: null } = {
  email: 'admin@vostok.local',
  password: 'Admin12345!',
  firstName: 'System',
  lastName: 'Admin',
  phone: null,
  role: ADMIN_USER_ROLES[0],
  status: UserStatus.ACTIVE,
};

function readEnvRole(): AdminRole | undefined {
  const value = process.env.ADMIN_ROLE;

  if (!value || !isAdminUserRole(value)) {
    return undefined;
  }

  return value;
}

function resolveInput(input: CreateAdminInput = {}): Required<CreateAdminInput> {
  return {
    email: input.email ?? process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN.email,
    password: input.password ?? process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN.password,
    firstName: input.firstName ?? process.env.ADMIN_FIRST_NAME ?? DEFAULT_ADMIN.firstName,
    lastName: input.lastName ?? process.env.ADMIN_LAST_NAME ?? DEFAULT_ADMIN.lastName,
    phone: input.phone ?? process.env.ADMIN_PHONE ?? DEFAULT_ADMIN.phone,
    role: input.role ?? readEnvRole() ?? DEFAULT_ADMIN.role,
    status: input.status ?? UserStatus.ACTIVE,
  };
}

export async function createAdminUser(input: CreateAdminInput = {}) {
  const prisma = new PrismaClient();
  const passwordService = new PasswordService();
  const payload = resolveInput(input);

  if (!isAdminUserRole(payload.role)) {
    throw new Error(`Role "${payload.role}" is not allowed for admin creation.`);
  }

  try {
    const passwordHash = await passwordService.preparePasswordHash(payload.password);

    const admin = await prisma.user.upsert({
      where: { email: payload.email },
      update: {
        phone: payload.phone,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role,
        status: payload.status,
        passwordHash,
      },
      create: {
        email: payload.email,
        phone: payload.phone,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role,
        status: payload.status,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    return {
      ...admin,
      password: payload.password,
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const before = new PrismaClient();

  try {
    const payload = resolveInput();
    const existing = await before.user.findUnique({
      where: { email: payload.email },
      select: { id: true },
    });

    const result = await createAdminUser(payload);
    console.log(`[admin:create] ${existing ? 'updated' : 'created'} admin user`);
    console.log(`email: ${result.email}`);
    console.log(`password: ${result.password}`);
    console.log(`role: ${result.role}`);
    console.log(`status: ${result.status}`);
  } finally {
    await before.$disconnect();
  }
}

void main().catch((error) => {
  console.error('[admin:create] failed', error);
  process.exitCode = 1;
});
