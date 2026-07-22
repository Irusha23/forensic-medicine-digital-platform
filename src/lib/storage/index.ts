import LocalStorage from './localStorage';
import S3Storage from './s3Storage';

const provider = process.env.STORAGE_PROVIDER || 'local';

let instance: any;
if (provider === 's3') {
  instance = new S3Storage();
} else {
  instance = new LocalStorage();
}

export default instance;

export type UploadResult = {
  path: string;
  provider: string;
  url?: string;
  checksum?: string;
};
