import { User } from '@prisma/client';
import { prisma } from '../setup/prisma-test-client';
import bcrypt from 'bcryptjs';

type UserCreateInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

let userCounter = 0;

export const DEFAULT_PASSWORD = 'Test123!@#';

export class UserFactory {
  static build(overrides: UserCreateInput = {}): UserCreateInput {
    userCounter++;
    return {
      email: `user${userCounter}@test.com`,
      name: `Test User ${userCounter}`,
      passwordHash: bcrypt.hashSync(DEFAULT_PASSWORD, 10),
      avatarUrl: null,
      ...overrides,
    };
  }

  static async create(overrides: UserCreateInput = {}): Promise<User> {
    const data = this.build(overrides);
    return prisma.user.create({
      data: data as any,
    });
  }

  static async createMany(count: number, overrides: UserCreateInput = {}): Promise<User[]> {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.create(overrides));
    }
    return users;
  }

  // Resetear contador (útil entre tests)
  static reset(): void {
    userCounter = 0;
  }
}
