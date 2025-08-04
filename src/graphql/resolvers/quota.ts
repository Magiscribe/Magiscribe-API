import { Quota as QuotaModel } from '@/database/models/quota';
import { updateUserQuota } from '@/database/procedures/quota';
import { Quota } from '@/graphql/codegen';

export default {
  Query: {
    getUserQuota: async (_, __, context) => {
      if (!context.auth?.sub) {
        throw new Error('User not authenticated');
      }

      const userId = context.auth.sub;

      // Find existing quota or create with defaults
      let quota = await QuotaModel.findOne({ userId });

      if (!quota) {
        // Create new quota by running update (which will upsert)
        await updateUserQuota(userId);
        quota = await QuotaModel.findOne({ userId });
      }

      if (!quota) {
        throw new Error('Failed to create or find quota record');
      }

      // Convert to plain object and ensure timestamps are properly formatted as ISO strings
      const rawResult = quota.toObject();
      const result: Quota = {
        userId: rawResult.userId,
        allowedTokens: rawResult.allowedTokens,
        usedTotalTokens: rawResult.usedTotalTokens,
        usedInputTokens: rawResult.usedInputTokens,
        usedOutputTokens: rawResult.usedOutputTokens,
        updatedAt: rawResult.updatedAt?.toISOString() ?? '',
        createdAt: rawResult.createdAt?.toISOString() ?? '',
      };

      return result;
    },
  },
};
