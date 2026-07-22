import { Request, Response } from 'express';
import { authenticateUser, registerUser, forgotPassword, resetPassword } from '../../services/auth.service';
import { logAudit } from '../../services/audit.service';

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const out = await authenticateUser(username, password);
  if (!out) return res.status(401).json({ error: 'invalid credentials' });
  
  await logAudit(out.user.user_id, 'USER_LOGIN', 'users', out.user.user_id, { ip: req.ip }, req.ip);

  res.json({ token: out.token, refresh: out.refresh, user: { id: out.user.user_id, username: out.user.username } });
}

export async function register(req: Request, res: Response) {
  const { username, password, roles } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const user = await registerUser(username, password, roles || []);
  res.json({ user: { id: user.user_id, username: user.username } });
}

export async function forgotPasswordController(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });
    
    const token = await forgotPassword(email);
    // In a real system, we would send this token via email.
    // Since we don't have an email system fully integrated yet, we'll return it in the response for testing.
    res.json({ message: 'If the email exists, a reset link has been sent.', _test_token: token });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to process request' });
  }
}

export async function resetPasswordController(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'token and newPassword are required' });
    
    await resetPassword(token, newPassword);
    res.json({ message: 'Password has been successfully reset' });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'failed to reset password' });
  }
}
