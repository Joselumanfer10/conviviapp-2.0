import { Home, HomeMember, User } from '@prisma/client';
import { HomeRole } from '@prisma/client';
import { prisma } from '../setup/prisma-test-client';
import { UserFactory } from './user.factory';

type HomeCreateInput = Partial<Omit<Home, 'id' | 'createdAt' | 'updatedAt'>>;

let homeCounter = 0;

export class HomeFactory {
  static build(overrides: HomeCreateInput = {}): HomeCreateInput {
    homeCounter++;
    return {
      name: `Test Home ${homeCounter}`,
      description: 'A test home for testing',
      address: '123 Test Street',
      inviteCode: `INVITE${homeCounter}${Date.now()}`,
      currency: 'EUR',
      defaultSplitMode: 'EQUAL',
      taskRotationEnabled: true,
      ...overrides,
    };
  }

  static async create(overrides: HomeCreateInput = {}): Promise<Home> {
    const data = this.build(overrides);
    return prisma.home.create({
      data: data as any,
    });
  }

  // Crear hogar con un admin
  static async createWithAdmin(
    adminOverrides: Partial<User> = {},
    homeOverrides: HomeCreateInput = {}
  ): Promise<{ home: Home; admin: User; membership: HomeMember }> {
    const admin = await UserFactory.create(adminOverrides);
    const home = await this.create(homeOverrides);

    const membership = await prisma.homeMember.create({
      data: {
        userId: admin.id,
        homeId: home.id,
        role: HomeRole.ADMIN,
        isActive: true,
      },
    });

    return { home, admin, membership };
  }

  // Crear hogar con múltiples miembros
  static async createWithMembers(
    memberCount: number,
    homeOverrides: HomeCreateInput = {}
  ): Promise<{
    home: Home;
    admin: User;
    members: User[];
    memberships: HomeMember[];
  }> {
    const { home, admin, membership } = await this.createWithAdmin({}, homeOverrides);

    const members: User[] = [];
    const memberships: HomeMember[] = [membership];

    for (let i = 0; i < memberCount - 1; i++) {
      const member = await UserFactory.create();
      members.push(member);

      const memberMembership = await prisma.homeMember.create({
        data: {
          userId: member.id,
          homeId: home.id,
          role: HomeRole.MEMBER,
          isActive: true,
        },
      });
      memberships.push(memberMembership);
    }

    return {
      home,
      admin,
      members: [admin, ...members],
      memberships,
    };
  }

  static reset(): void {
    homeCounter = 0;
  }
}
