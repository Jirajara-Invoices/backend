import { dateScalarResolvers } from "./types/date";
import { userQueryResolvers } from "./users/queries";
import { userMutationResolvers } from "./users/mutations";

export const resolvers = {
  ...dateScalarResolvers,
  Query: {
    ...userQueryResolvers,
  },
  Mutation: {
    ...userMutationResolvers,
  },
};
