import mutations from './mutation';
import query from './query';

const resolvers = {
  Query: query,
  Mutation: mutations,
};

export default resolvers;
