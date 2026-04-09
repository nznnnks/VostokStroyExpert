import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

@Injectable()
export class PasswordService {
  async preparePasswordHash(value: string) {
    if (this.isPasswordHash(value)) {
      return value;
    }

    return this.hashPassword(value);
  }

  async hashPassword(value: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(value, salt, 64)) as Buffer;
    return `scrypt$${salt}$${derivedKey.toString('hex')}`;
  }

  async verifyPassword(plainText: string, storedValue: string) {
    if (!this.isPasswordHash(storedValue)) {
      return plainText === storedValue;
    }

    const [, salt, expectedHash] = storedValue.split('$');

    if (!salt || !expectedHash) {
      return false;
    }

    const derivedKey = (await scryptAsync(plainText, salt, 64)) as Buffer;
    const expectedBuffer = Buffer.from(expectedHash, 'hex');

    if (derivedKey.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, expectedBuffer);
  }

  private isPasswordHash(value: string) {
    return value.startsWith('scrypt$');
  }
}
