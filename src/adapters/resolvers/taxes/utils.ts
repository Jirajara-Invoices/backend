import { GraphQLError } from "graphql/error";

import { TaxCalcType } from "../../../entities/models/taxes";

export function mapTaxCalcType(type: string): TaxCalcType {
  switch (type.toLowerCase()) {
    case "percentage":
      return TaxCalcType.Percentage;
    case "fixed":
      return TaxCalcType.Fixed;
    default:
      throw new GraphQLError(`Invalid tax calculation type: ${type}`);
  }
}
