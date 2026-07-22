import { Request, Response } from 'express';
import { listUsers, createUser, updateUserRoles, toggleUserStatus } from '../../services/user.service';
import bcrypt from 'bcryptjs';

export async function getUsersController(req: Request, res: Response) {
  try {
    const users = await listUsers();
    // Sanitize output
    const sanitized = users.map(u => ({
      user_id: u.user_id.toString(),
      username: u.username,
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      designation: u.designation,
      is_active: u.is_active,
      roles: u.user_role.map(ur => ur.roles.role_name)
    }));
    res.json(sanitized);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list users' });
  }
}

export async function createUserController(req: Request, res: Response) {
  try {
    const { username, email, password, first_name, last_name, designation, roles } = req.body;
    let password_hash;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }
    const user = await createUser({
      username,
      email,
      password_hash,
      first_name,
      last_name,
      designation,
      roles: roles || []
    });
    res.status(201).json({ ok: true, user_id: user.user_id.toString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create user' });
  }
}

export async function updateUserRolesController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { roles } = req.body;
    await updateUserRoles(Number(id), roles || []);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update roles' });
  }
}

export async function toggleUserStatusController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    await toggleUserStatus(Number(id), Boolean(is_active));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to toggle status' });
  }
}
