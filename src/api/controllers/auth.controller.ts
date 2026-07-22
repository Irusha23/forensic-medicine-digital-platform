import { Request, Response } from 'express';
import { authenticateUser, registerUser } from '../../services/auth.service';

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const out = await authenticateUser(username, password);
  if (!out) return res.status(401).json({ error: 'invalid credentials' });
  res.json({ token: out.token, refresh: out.refresh, user: { id: out.user.user_id, username: out.user.username } });
}

export async function register(req: Request, res: Response) {
  const { username, password, roles } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const user = await registerUser(username, password, roles || []);
  res.json({ user: { id: user.user_id, username: user.username } });
}
