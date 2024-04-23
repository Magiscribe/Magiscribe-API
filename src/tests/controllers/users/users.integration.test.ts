import config from '@/config';
import * as clientsModule from '@/utils/clients';
import {
  getUserByEmail,
  getUserById,
  getUsersByEmail,
  getUsersById,
  registerUser,
} from '@/controllers/users';
import database from '@/database';
import { User } from '@/database/models/user';

const TEST_SUB = 'test-sub';
const TEST_EMAIL = config.email.testEmailTo!;

// Mock only the Clerk methods we need
jest
  .spyOn(clientsModule.clerkClient.users, 'getUser')
  .mockImplementation(jest.fn());
jest
  .spyOn(clientsModule.clerkClient.users, 'getUserList')
  .mockImplementation(jest.fn());

describe('Users Controller Tests', () => {
  beforeAll(async () => {
    await database.init();
  });

  afterAll(async () => {
    await database.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Add user to database with id test-sub
    await User.deleteOne({ sub: TEST_SUB });
  });

  const mockUser = {
    id: TEST_SUB,
    primaryEmailAddress: { emailAddress: TEST_EMAIL },
    primaryPhoneNumber: { phoneNumber: '+1234567890' },
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
  };

  describe('getUsersById', () => {
    it('should fetch users by IDs', async () => {
      (
        clientsModule.clerkClient.users.getUserList as jest.Mock
      ).mockResolvedValue({
        data: [mockUser],
      });

      const result = await getUsersById({ userIds: [TEST_SUB] });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockUser.id,
        primaryEmailAddress: mockUser.primaryEmailAddress.emailAddress,
        phone: mockUser.primaryPhoneNumber.phoneNumber,
        username: mockUser.username,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      });
    });

    it('should return empty array for no IDs', async () => {
      const result = await getUsersById({ userIds: [] });
      expect(result).toEqual([]);
    });

    it('should handle clerk api errors', async () => {
      (
        clientsModule.clerkClient.users.getUserList as jest.Mock
      ).mockRejectedValue(new Error('Clerk API Error'));

      await expect(getUsersById({ userIds: [TEST_SUB] })).rejects.toThrow(
        'Failed to fetch users',
      );
    });
  });

  describe('getUsersByEmail', () => {
    it('should fetch users by email', async () => {
      (
        clientsModule.clerkClient.users.getUserList as jest.Mock
      ).mockResolvedValue({
        data: [mockUser],
      });

      const result = await getUsersByEmail({
        userEmails: [TEST_EMAIL],
      });

      expect(result).toHaveLength(1);
      expect(result[0].primaryEmailAddress).toBe(TEST_EMAIL);
    });

    it('should return empty array for no emails', async () => {
      const result = await getUsersByEmail({ userEmails: [] });
      expect(result).toEqual([]);
    });

    it('should handle clerk api errors', async () => {
      (
        clientsModule.clerkClient.users.getUserList as jest.Mock
      ).mockRejectedValue(new Error('Clerk API Error'));

      await expect(
        getUsersByEmail({ userEmails: [TEST_EMAIL] }),
      ).rejects.toThrow('Failed to fetch users');
    });
  });

  describe('getUserById', () => {
    it('should fetch single user by ID', async () => {
      (clientsModule.clerkClient.users.getUser as jest.Mock).mockResolvedValue(
        mockUser,
      );

      const result = await getUserById({ sub: TEST_SUB });
      expect(result).toBeDefined();
      expect(result?.id).toBe(TEST_SUB);
    });

    it('should handle clerk api errors', async () => {
      (clientsModule.clerkClient.users.getUser as jest.Mock).mockRejectedValue(
        new Error('Clerk API Error'),
      );

      await expect(getUserById({ sub: TEST_SUB })).rejects.toThrow(
        'Failed to fetch user',
      );
    });

    it('should return null for non-existent user', async () => {
      (clientsModule.clerkClient.users.getUser as jest.Mock).mockResolvedValue(
        null,
      );

      const result = await getUserById({ sub: 'non-existent' });
      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should fetch single user by email', async () => {
      (
        clientsModule.clerkClient.users.getUserList as jest.Mock
      ).mockResolvedValue({
        data: [mockUser],
      });

      const result = await getUserByEmail({
        email: TEST_EMAIL,
      });
      expect(result).toBeDefined();
      expect(result?.primaryEmailAddress).toBe(TEST_EMAIL);
    });

    it('should handle clerk api errors', async () => {
      (
        clientsModule.clerkClient.users.getUserList as jest.Mock
      ).mockRejectedValue(new Error('Clerk API Error'));

      await expect(getUserByEmail({ email: TEST_EMAIL })).rejects.toThrow(
        'Failed to fetch user',
      );
    });

    it('should return null when no user found', async () => {
      (
        clientsModule.clerkClient.users.getUserList as jest.Mock
      ).mockResolvedValue({
        data: [],
      });

      const result = await getUserByEmail({ email: 'nonexistent@example.com' });
      expect(result).toBeNull();
    });
  });

  describe('registerUser', () => {
    it('should register new user successfully', async () => {
      (clientsModule.clerkClient.users.getUser as jest.Mock).mockResolvedValue(
        mockUser,
      );

      // Add user to database with id test-sub
      await User.create({
        sub: TEST_SUB,
        email: TEST_EMAIL,
      });

      const result = await registerUser({ sub: TEST_SUB });
      expect(result).toBeDefined();

      const dbUser = await User.findOne({ sub: TEST_SUB });
      expect(dbUser).toBeDefined();
    });

    it('should handle registration of existing user', async () => {
      (clientsModule.clerkClient.users.getUser as jest.Mock).mockResolvedValue(
        mockUser,
      );

      await User.create({
        sub: TEST_SUB,
        email: TEST_EMAIL,
      });

      // Register user twice
      await registerUser({ sub: TEST_SUB });
      const result = await registerUser({ sub: TEST_SUB });

      expect(result).toBeDefined();

      // Verify only one user exists
      const count = await User.countDocuments({ sub: TEST_SUB });
      expect(count).toBe(1);
    });

    it('should handle non-existent Clerk user', async () => {
      (clientsModule.clerkClient.users.getUser as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(registerUser({ sub: 'invalid-sub' })).rejects.toThrow(
        'Failed to register user',
      );

      const dbUser = await User.findOne({ sub: 'invalid-sub' });
      expect(dbUser).toBeNull();
    });

    it('should handle database errors', async () => {
      (clientsModule.clerkClient.users.getUser as jest.Mock).mockResolvedValue(
        mockUser,
      );

      // Force a database error
      jest
        .spyOn(User, 'findOneAndUpdate')
        .mockRejectedValue(new Error('DB Error'));

      await expect(registerUser({ sub: TEST_SUB })).rejects.toThrow(
        'Failed to register user',
      );
    });
  });
});
