import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';

export class SecureStorage {
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32; // for AES-256
  private readonly dataDir: string;
  private encryptionKey: Buffer | null = null;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
  }

  async initialize(password: string): Promise<void> {
    // Generate encryption key from password using scrypt
    const salt = await this.getSalt();
    this.encryptionKey = await promisify(scrypt)(
      password,
      salt,
      SecureStorage.KEY_LENGTH
    ) as Buffer;

    // Ensure data directory exists
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  async store(key: string, data: any): Promise<void> {
    if (!this.encryptionKey) {
      throw new Error('SecureStorage not initialized');
    }

    const iv = randomBytes(16);
    const cipher = createCipheriv(
      SecureStorage.ENCRYPTION_ALGORITHM,
      this.encryptionKey,
      iv
    );

    const jsonData = JSON.stringify(data);
    const encryptedData = Buffer.concat([
      cipher.update(jsonData, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    // Store IV, encrypted data, and auth tag
    const fileContent = {
      iv: iv.toString('hex'),
      data: encryptedData.toString('hex'),
      authTag: authTag.toString('hex'),
    };

    await fs.writeFile(
      path.join(this.dataDir, `${key}.json`),
      JSON.stringify(fileContent)
    );
  }

  async retrieve(key: string): Promise<any> {
    if (!this.encryptionKey) {
      throw new Error('SecureStorage not initialized');
    }

    const filePath = path.join(this.dataDir, `${key}.json`);
    
    try {
      const fileContent = JSON.parse(
        await fs.readFile(filePath, 'utf8')
      );

      const decipher = createDecipheriv(
        SecureStorage.ENCRYPTION_ALGORITHM,
        this.encryptionKey,
        Buffer.from(fileContent.iv, 'hex')
      );

      decipher.setAuthTag(Buffer.from(fileContent.authTag, 'hex'));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(fileContent.data, 'hex')),
        decipher.final(),
      ]);

      return JSON.parse(decrypted.toString());
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  private async getSalt(): Promise<Buffer> {
    const saltPath = path.join(this.dataDir, 'salt');
    try {
      return await fs.readFile(saltPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        const salt = randomBytes(32);
        await fs.mkdir(this.dataDir, { recursive: true });
        await fs.writeFile(saltPath, salt);
        return salt;
      }
      throw error;
    }
  }
} 