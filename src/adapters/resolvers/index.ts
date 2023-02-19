import { dateScalarResolvers } from "./types/date";
import { userTypeResolvers } from "./types/user";
import { userQueryResolvers } from "./users/queries";
import { userMutationResolvers } from "./users/mutations";
import { addressQueryResolvers } from "./addresses/queries";
import { addressMutationResolvers } from "./addresses/mutations";
import { addressTypeResolvers } from "./addresses/types";
import { taxQueryResolvers } from "./taxes/queries";
import { taxMutationResolvers } from "./taxes/mutations";
import { taxTypeResolvers } from "./taxes/types";

export const resolvers = {
  ...dateScalarResolvers,
  Query: {
    ...userQueryResolvers,
    ...addressQueryResolvers,
    ...taxQueryResolvers,
  },
  Mutation: {
    ...userMutationResolvers,
    ...addressMutationResolvers,
    ...taxMutationResolvers,
  },
  User: userTypeResolvers,
  Address: addressTypeResolvers,
  Tax: taxTypeResolvers,
};
