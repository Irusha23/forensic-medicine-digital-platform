import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function backupDatabase() {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPass = process.env.DB_PASS || 'password';
  const dbName = process.env.DB_NAME || 'forensic_platform';
  
  const backupDir = path.join(__dirname, '../../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup-${dbName}-${dateStr}.sql`);

  // We are using a local MariaDB/MySQL instance.
  const dumpCommand = `mysqldump -h ${dbHost} -u ${dbUser} -p${dbPass} ${dbName} > "${backupFile}"`;

  try {
    console.log(`Starting database backup to ${backupFile}...`);
    await execAsync(dumpCommand);
    console.log('Database backup completed successfully.');
    return backupFile;
  } catch (error) {
    console.error('Database backup failed:', error);
    throw error;
  }
}
