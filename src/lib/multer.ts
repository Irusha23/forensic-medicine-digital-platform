import multer from 'multer';
import path from 'path';
import fs from 'fs';

const tmp = path.resolve(process.env.UPLOADS_ROOT || './data/uploads', 'tmp');
fs.mkdirSync(tmp, { recursive: true });

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, tmp);
  },
  filename: function (_req, file, cb) {
    const now = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${now}_${safe}`);
  }
});

function fileFilter(_req: any, file: { originalname: string; mimetype: string }, cb: multer.FileFilterCallback) {
  const allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream'
  ]);
  const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.txt', '.doc', '.docx', '.xls', '.xlsx']);
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!allowedMimeTypes.has(file.mimetype) && !allowedExtensions.has(ext)) {
    return cb(new Error('Invalid file type'), false);
  }
  cb(null, true);
}

export default multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });
