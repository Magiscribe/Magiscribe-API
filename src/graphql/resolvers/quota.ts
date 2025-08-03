import { Quota } from '@/database/models/quota';
import { updateUserQuota } from '@/database/procedures/quota';

export default {
  Query: {
    getUserQuota: async (_, __, context) => {
      if (!context.auth?.sub) {
        throw new Error('User not authenticated');
      }

      const userId = context.auth.sub;
      
      // Find existing quota or create with defaults
      let quota = await Quota.findOne({ userId });
      
      if (!quota) {
        // Create new quota by running update (which will upsert)
        await updateUserQuota(userId);
        quota = await Quota.findOne({ userId });
      }

      if (!quota) {
        throw new Error('Failed to create or find quota record');
      }

      // Convert to plain object and ensure timestamps are properly formatted as ISO strings
      const result = quota.toObject() as any;
      if (result.updatedAt && result.updatedAt instanceof Date) {
        result.updatedAt = result.updatedAt.toISOString();
      }
      if (result.createdAt && result.createdAt instanceof Date) {
        result.createdAt = result.createdAt.toISOString();
      }

      return result;
    },
  },
};
