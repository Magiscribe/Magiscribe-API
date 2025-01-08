import { sendContactMessage } from '@/controllers/contact';
import { MutationContactArgs } from '@/graphql/codegen';

export default {
  Mutation: {
    contact: async (_, { input }: MutationContactArgs) => {
      const messageId = await sendContactMessage(input);
      return {
        success: true,
        messageId,
      };
    },
  },
};
