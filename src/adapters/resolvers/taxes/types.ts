import { Tax } from "../../../entities/models/taxes";
import { GraphQLContext } from "../../../utilities/context";

export const taxTypeResolvers = {
  id: (tax: Tax) => tax.id,
  name: (tax: Tax) => tax.name,
  rate: (tax: Tax) => tax.rate,
  calcType: (tax: Tax) => tax.calc_type.toUpperCase(),
  user: async (tax: Tax, _: unknown, { useCases }: GraphQLContext) => {
    const useCase = useCases.users;

    return await useCase.findByID(tax.user_id, true);
  },
  createdAt: (tax: Tax) => tax.created_at,
  updatedAt: (tax: Tax) => tax.updated_at,
  deletedAt: (tax: Tax) => tax.deleted_at,
};
