import { dateScalarResolvers } from "./types/date";
import { userTypeResolvers } from "./types/user";
import { userQueryResolvers } from "./users/queries";
import { userMutationResolvers } from "./users/mutations";
import { addressQueryResolvers } from "./addresses/queries";
import { addressMutationResolvers } from "./addresses/mutations";
import { addressTypeResolvers } from "./addresses/types";

export const resolvers = {
  ...dateScalarResolvers,
  Query: {
    ...userQueryResolvers,
    ...addressQueryResolvers,
  },
  Mutation: {
    ...userMutationResolvers,
    ...addressMutationResolvers,
  },
  User: userTypeResolvers,
  Address: addressTypeResolvers,
};
