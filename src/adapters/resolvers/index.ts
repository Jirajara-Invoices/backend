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
import { invoiceQueryResolvers } from "./invoices/queries";
import { invoiceMutationResolvers } from "./invoices/mutations";
import { invoiceTypeResolvers } from "./invoices/types";

export const resolvers = {
  ...dateScalarResolvers,
  Query: {
    ...userQueryResolvers,
    ...addressQueryResolvers,
    ...taxQueryResolvers,
    ...invoiceQueryResolvers,
  },
  Mutation: {
    ...userMutationResolvers,
    ...addressMutationResolvers,
    ...taxMutationResolvers,
    ...invoiceMutationResolvers,
  },
  User: userTypeResolvers,
  Address: addressTypeResolvers,
  Tax: taxTypeResolvers,
  Invoice: invoiceTypeResolvers,
};
