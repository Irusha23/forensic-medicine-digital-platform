import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET = process.env.S3_BUCKET || '';

class S3Storage {
  client: S3Client;
  bucket: string;
  constructor() {
    this.client = new S3Client({ region: REGION });
    this.bucket = BUCKET;
  }

  async put(tempPath: string, destKey: string) {
    if (!this.bucket) throw new Error('S3_BUCKET not configured');
    const body = fs.createReadStream(tempPath);
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: destKey, Body: body }));
    const checksum = await this.sha256File(tempPath);
    // optionally remove temp file
    try { fs.unlinkSync(tempPath); } catch (e) {}
    return { path: destKey, provider: 's3', checksum, url: `s3://${this.bucket}/${destKey}` };
  }

  async sha256File(p: string) {
    const data = fs.readFileSync(p);
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async getStream(_key: string) {
    throw new Error('S3 streaming is not implemented yet');
  }

  async delete(key: string) {
    // implement as needed
  }
}

export default S3Storage;
