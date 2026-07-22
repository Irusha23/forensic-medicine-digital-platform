import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

export async function listUsers() {
  return prisma.users.findMany({
    include: {
      user_role: {
        include: {
          roles: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function createUser(data: { username: string, email: string, password_hash?: string, first_name?: string, last_name?: string, designation?: string, roles: string[] }) {
  return prisma.$transaction(async (tx) => {
    let hashed = data.password_hash;
    if (!hashed) {
      hashed = await bcrypt.hash('defaultPassword123', 10);
    }

    const user = await tx.users.create({
      data: {
        username: data.username,
        email: data.email,
        password_hash: hashed,
        first_name: data.first_name,
        last_name: data.last_name,
        designation: data.designation,
        is_active: true
      }
    });

    for (const r of data.roles) {
      const role = await tx.roles.findFirst({ where: { role_name: r } });
      if (role) {
        await tx.user_role.create({
          data: {
            user_id: user.user_id,
            role_id: role.role_id
          }
        });
      }
    }

    return user;
  });
}

export async function updateUserRoles(userId: number, roles: string[]) {
  return prisma.$transaction(async (tx) => {
    // Delete existing roles
    await tx.user_role.deleteMany({
      where: { user_id: BigInt(userId) }
    });

    // Assign new roles
    for (const r of roles) {
      const role = await tx.roles.findFirst({ where: { role_name: r } });
      if (role) {
        await tx.user_role.create({
          data: {
            user_id: BigInt(userId),
            role_id: role.role_id
          }
        });
      }
    }
  });
}

export async function toggleUserStatus(userId: number, isActive: boolean) {
  return prisma.users.update({
    where: { user_id: BigInt(userId) },
    data: { is_active: isActive }
  });
}
