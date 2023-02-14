import { Address } from "../../../entities/models/addresses";
import { GraphQLContext } from "../../../utilities/context";

export const addressTypeResolvers = {
  id: (address: Address) => address.id,
  name: (address: Address) => address.name,
  type: (address: Address) => address.type.toUpperCase(),
  user: async (address: Address, _: unknown, { useCases }: GraphQLContext) => {
    const useCase = useCases.users;

    return await useCase.findByID(address.user_id, true);
  },
  email: (address: Address) => address.email,
  taxId: (address: Address) => address.tax_id,
  street: (address: Address) => address.street,
  number: (address: Address) => address.number,
  comment: (address: Address) => address.comment,
  city: (address: Address) => address.city,
  state: (address: Address) => address.state,
  zipcode: (address: Address) => address.zipcode,
  country: (address: Address) => address.country,
  createdAt: (address: Address) => address.created_at,
  updatedAt: (address: Address) => address.updated_at,
  deletedAt: (address: Address) => address.deleted_at,
};
