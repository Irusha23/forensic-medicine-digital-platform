import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOADS_ROOT = process.env.UPLOADS_ROOT || './data/uploads';

class LocalStorage {
  root: string;
  constructor() {
    this.root = UPLOADS_ROOT;
  }

  async ensureDir(dir: string) {
    await fsPromises.mkdir(dir, { recursive: true });
  }

  async put(tempPath: string, destKey: string) {
    const destPath = path.join(this.root, destKey);
    const destDir = path.dirname(destPath);
    await this.ensureDir(destDir);
    await fsPromises.rename(tempPath, destPath);
    const checksum = await this.sha256File(destPath);
    return { path: destPath, provider: 'local', checksum };
  }

  async sha256File(p: string) {
    const stream = await fsPromises.readFile(p);
    const hash = crypto.createHash('sha256').update(stream).digest('hex');
    return hash;
  }

  async getStream(key: string) {
    const cwd = process.cwd();
    const resolvedRoot = path.isAbsolute(this.root) ? path.resolve(this.root) : path.resolve(cwd, this.root);
    const resolvedPath = path.isAbsolute(key) ? path.resolve(key) : path.resolve(cwd, key);
    const isInsideRoot = resolvedPath === resolvedRoot || resolvedPath.startsWith(resolvedRoot + path.sep) || resolvedPath.startsWith(cwd + path.sep);
    if (!isInsideRoot) throw new Error('Invalid storage path');
    return fs.createReadStream(resolvedPath);
  }

  async delete(key: string) {
    const p = path.join(this.root, key);
    try { await fsPromises.unlink(p); } catch (e) { /* ignore */ }
  }
}

export default LocalStorage;
