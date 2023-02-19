import { GraphQLError } from "graphql/error";

import { AddressType } from "../../../entities/models/addresses";

export function mapAddressType(type: string): AddressType {
  switch (type.toLowerCase()) {
    case "personal":
      return AddressType.Personal;
    case "clients":
      return AddressType.Clients;
    default:
      throw new GraphQLError(`Invalid address type: ${type}`);
  }
}
