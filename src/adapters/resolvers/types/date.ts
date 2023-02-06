import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";

export const dateScalarResolvers = {
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "Custom date scalar",
    parseValue(value) {
      return value;
    },
    serialize(value) {
      return new Date(String(value));
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value);
      }
      return null;
    },
  }),
};
