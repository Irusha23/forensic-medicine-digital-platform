import request from 'supertest';
import app from '../server';
import prisma from '../lib/prisma';
import * as authService from '../services/auth.service';
import fs from 'fs';
import path from 'path';
import os from 'os';

jest.spyOn(authService, 'verifyToken').mockReturnValue({ userId: 1, roles: ['Admin', 'Doctor'] });

describe('Boundary Testing (Large File Uploads)', () => {
  let caseId: string | number | bigint;
  let dummyFilePath: string;

  beforeAll(async () => {
    const newCase = await prisma.cases.create({
      data: {
        case_number: `MEDIA-TEST-${Date.now()}`,
        status: 'OPEN',
      }
    });
    caseId = newCase.case_id;

    // Create a 55MB dummy file
    dummyFilePath = path.join(os.tmpdir(), 'large-dummy-file.txt');
    
    // Write 55MB of data
    // 55MB = 55 * 1024 * 1024 bytes
    const size = 55 * 1024 * 1024;
    
    // We can write a chunk repeatedly to avoid holding 55MB in memory at once
    const chunk = Buffer.alloc(1024 * 1024, 'a'); // 1MB chunk
    const fd = fs.openSync(dummyFilePath, 'w');
    for (let i = 0; i < 55; i++) {
      fs.writeSync(fd, chunk, 0, chunk.length, null);
    }
    fs.closeSync(fd);
  });

  afterAll(async () => {
    await prisma.cases.delete({ where: { case_id: BigInt(caseId) } }).catch(() => {});
    if (fs.existsSync(dummyFilePath)) {
      fs.unlinkSync(dummyFilePath);
    }
    jest.restoreAllMocks();
  });

  it('should gracefully reject an upload that exceeds the size limit (55MB) without crashing', async () => {
    const res = await request(app)
      .post(`/api/cases/${caseId}/media`)
      .set('Authorization', 'Bearer fake-token')
      .attach('file', dummyFilePath);
    
    // Should be 400 (currently mapped in case.routes.ts) or 413 Payload Too Large
    expect([400, 413]).toContain(res.status);
    
    // Should contain a JSON error message
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('too large'); // Multer throws "File too large"
  });
});
