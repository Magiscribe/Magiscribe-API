import {
  getUserByEmail,
  getUserById,
  getUsersByEmail,
  getUsersById,
  registerUser,
} from '@/controllers/users';
import { Inquiry } from '@/database/models/inquiry';
import { User } from '@/database/models/user';
import { clerkClient } from '@/utils/clients';
import { sendWelcomeEmail } from '@/utils/emails/types';

jest.mock('@/utils/clients', () => ({
  clerkClient: {
    users: {
      getUser: jest.fn(),
      getUserList: jest.fn(),
    },
  },
}));

jest.mock('@/utils/emails/types', () => ({
  sendWelcomeEmail: jest.fn(),
}));

jest.mock('@/database/models/user', () => ({
  User: {
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock('@/database/models/inquiry', () => ({
  Inquiry: {
    create: jest.fn(),
  },
}));

describe('Users Controller Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser1 = {
        id: 'test-id',
        primaryEmailAddress: { emailAddress: 'test@example.com' },
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      };
      const mockUser2 = {
        id: 'test-id',
        primaryPhoneNumber: { phoneNumber: '123-456-7890' },
        primaryEmailAddress: undefined,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      };

      (clerkClient.users.getUser as jest.Mock).mockResolvedValueOnce(mockUser1);

      const result = await getUserById({ sub: 'test-id' });

      expect(result).toEqual({
        id: mockUser1.id,
        primaryEmailAddress: mockUser1.primaryEmailAddress.emailAddress,
        phone: undefined,
        username: mockUser1.username,
        firstName: mockUser1.firstName,
        lastName: mockUser1.lastName,
      });

      (clerkClient.users.getUser as jest.Mock).mockResolvedValueOnce(mockUser2);

      const result2 = await getUserById({ sub: 'test-id' });

      expect(result2).toEqual({
        id: mockUser2.id,
        primaryEmailAddress: undefined,
        phone: mockUser2.primaryPhoneNumber.phoneNumber,
        username: mockUser2.username,
        firstName: mockUser2.firstName,
        lastName: mockUser2.lastName,
      });
    });

    it('should return null when user not found', async () => {
      (clerkClient.users.getUser as jest.Mock).mockResolvedValueOnce(null);

      const result = await getUserById({ sub: 'test-id' });

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (clerkClient.users.getUser as jest.Mock).mockRejectedValueOnce(
        new Error('API Error'),
      );

      await expect(getUserById({ sub: 'test-id' })).rejects.toThrow(
        'Failed to fetch user',
      );
    });
  });

  describe('getUsersByEmail', () => {
    it('should return users when found', async () => {
      const mockUsers = [
        {
          id: 'test-id',
          primaryEmailAddress: { emailAddress: 'test@example.com' },
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
      ];

      (clerkClient.users.getUserList as jest.Mock).mockResolvedValueOnce({
        data: mockUsers,
      });

      const result = await getUsersByEmail({
        userEmails: ['test@example.com'],
      });

      expect(result).toHaveLength(1);
      expect(result[0].primaryEmailAddress).toBe('test@example.com');
    });

    it('should return empty array for empty input', async () => {
      const result = await getUsersByEmail({ userEmails: [] });
      expect(result).toEqual([]);
    });

    it('should handle clerk api errors', async () => {
      (clerkClient.users.getUserList as jest.Mock).mockRejectedValueOnce(
        new Error('API Error'),
      );

      await expect(
        getUsersByEmail({ userEmails: ['test@example.com'] }),
      ).rejects.toThrow('Failed to fetch users');
    });
  });

  describe('getUserByEmail', () => {
    it('should return first user when found', async () => {
      const mockUsers = [
        {
          id: 'test-id',
          primaryEmailAddress: { emailAddress: 'test@example.com' },
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
      ];

      (clerkClient.users.getUserList as jest.Mock).mockResolvedValueOnce({
        data: mockUsers,
      });

      const result = await getUserByEmail({ email: 'test@example.com' });
      expect(result).toBeDefined();
      expect(result?.primaryEmailAddress).toBe('test@example.com');
    });

    it('should return null when no user found', async () => {
      (clerkClient.users.getUserList as jest.Mock).mockResolvedValueOnce({
        data: [],
      });

      const result = await getUserByEmail({ email: 'nonexistent@example.com' });
      expect(result).toBeNull();
    });

    it('should handle clerk api errors', async () => {
      (clerkClient.users.getUserList as jest.Mock).mockRejectedValueOnce(
        new Error('API Error'),
      );

      await expect(
        getUserByEmail({ email: 'test@example.com' }),
      ).rejects.toThrow('Failed to fetch user');
    });
  });

  describe('getUsersById', () => {
    it('should return users when found', async () => {
      const mockUsers = [
        {
          id: 'test-id',
          primaryEmailAddress: { emailAddress: 'test@example.com' },
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
      ];

      (clerkClient.users.getUserList as jest.Mock).mockResolvedValueOnce({
        data: mockUsers,
      });

      const result = await getUsersById({ userIds: ['test-id'] });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-id');
    });

    it('should return empty array for empty input', async () => {
      const result = await getUsersById({ userIds: [] });
      expect(result).toEqual([]);
    });

    it('should handle clerk api errors', async () => {
      (clerkClient.users.getUserList as jest.Mock).mockRejectedValueOnce(
        new Error('API Error'),
      );

      await expect(getUsersById({ userIds: ['test-id'] })).rejects.toThrow(
        'Failed to fetch users',
      );
    });
  });

  describe('registerUser', () => {
    it('should register user successfully', async () => {
      const mockUser = {
        id: 'test-id',
        primaryEmailAddress: { emailAddress: 'test@example.com' },
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      };

      (clerkClient.users.getUser as jest.Mock).mockResolvedValueOnce(mockUser);
      (User.findOneAndUpdate as jest.Mock).mockResolvedValueOnce({
        sub: 'test-sub',
      });
      (Inquiry.create as jest.Mock).mockResolvedValueOnce({ id: 'test-id' });

      const result = await registerUser({
        sub: 'test-sub',
      });

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'test-sub' },
        { _id: 'test-sub' },
        { upsert: true, new: true },
      );
      expect(sendWelcomeEmail).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw error when user not found in Clerk', async () => {
      (clerkClient.users.getUser as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        registerUser({
          sub: 'test-sub',
        }),
      ).rejects.toThrow('Failed to register user');
    });

    it('should handle database errors', async () => {
      const mockUser = {
        id: 'test-id',
        primaryEmailAddress: { emailAddress: 'test@example.com' },
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      };

      (clerkClient.users.getUser as jest.Mock).mockResolvedValueOnce(mockUser);
      (User.findOneAndUpdate as jest.Mock).mockRejectedValueOnce(
        new Error('DB Error'),
      );

      await expect(
        registerUser({
          sub: 'test-sub',
        }),
      ).rejects.toThrow('Failed to register user');
    });
  });
});
