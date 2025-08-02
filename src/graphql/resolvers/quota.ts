import { Quota } from '@/database/models/quota';
import { updateAllUserQuotas, updateUserQuota } from '@/database/procedures/quota';

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

      return quota;
    },
  },
  Mutation: {
    runQuotaUpdate: async (_, __, context) => {
      if (!context.auth?.sub) {
        throw new Error('User not authenticated');
      }

      try {
        await updateAllUserQuotas();
        return 'Quota update completed successfully';
      } catch (error) {
        console.error('Manual quota update failed:', error);
        throw new Error('Quota update failed');
      }
    },
  },
};
