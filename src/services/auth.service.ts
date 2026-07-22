import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

export async function registerUser(username: string, password: string, roles: string[] = []) {
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.users.create({
    data: { username, password_hash: hashed, email: `${username}@example.local` }
  });
  for (const r of roles) {
    const role = await prisma.roles.findFirst({ where: { role_name: r } });
    if (role) {
      await prisma.user_role.create({ data: { user_id: user.user_id as any, role_id: role.role_id } });
    }
  }
  return user;
}

export async function authenticateUser(username: string, password: string) {
  const user = await prisma.users.findUnique({ where: { username }, include: { user_role: { include: { roles: true } } } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return null;
  const roles = user.user_role.map(ur => ur.roles.role_name);
  const payload = { userId: user.user_id.toString(), roles, username: user.username };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  const refresh = jwt.sign({ userId: user.user_id.toString() }, JWT_SECRET, { expiresIn: '7d' });
  return { user, token, refresh };
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
}

export async function forgotPassword(email: string) {
  const user = await prisma.users.findFirst({ where: { email } });
  if (!user) return null; 
  
  const payload = { userId: user.user_id.toString(), purpose: 'reset-password' };
  const secret = JWT_SECRET + user.password_hash;
  const token = jwt.sign(payload, secret, { expiresIn: '15m' });
  
  return token;
}

export async function resetPassword(token: string, newPassword: string) {
  const decoded = jwt.decode(token) as any;
  if (!decoded || !decoded.userId || decoded.purpose !== 'reset-password') {
    throw new Error('Invalid token');
  }

  const user = await prisma.users.findUnique({ where: { user_id: BigInt(decoded.userId) } });
  if (!user) throw new Error('User not found');

  const secret = JWT_SECRET + user.password_hash;
  try {
    jwt.verify(token, secret);
  } catch(e) {
    throw new Error('Invalid or expired token');
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.users.update({
    where: { user_id: user.user_id },
    data: { password_hash: hashed }
  });
  return true;
}
