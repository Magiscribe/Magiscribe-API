import mutations from './mutation';
import query from './query';
import subscription from './subscription';

const resolvers = {
  Query: query,
  Mutation: mutations,
  Subscription: subscription,
};

export default resolvers;
