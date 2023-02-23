import { defaultFieldResolver, GraphQLFieldConfig, GraphQLSchema } from "graphql";
import { GraphQLError } from "graphql/error";
import { getDirective, MapperKind, mapSchema } from "@graphql-tools/utils";

import { UserRole } from "../entities/models/users";
import { GraphQLContext } from "./context";

export function createAuthDirective(schema: GraphQLSchema, directiveName: string) {
  const typeDirectiveArgumentMaps: Record<string, any> = {};

  return mapSchema(schema, {
    [MapperKind.TYPE]: (type) => {
      const authDirective = getDirective(schema, type, directiveName)?.[0];
      if (authDirective) {
        typeDirectiveArgumentMaps[type.name] = authDirective;
      }
      return undefined;
    },
    [MapperKind.OBJECT_FIELD]: (
      fieldConfig: GraphQLFieldConfig<any, any>,
      _fieldName,
      typeName,
    ) => {
      const authDirective =
        getDirective(schema, fieldConfig, directiveName)?.[0] ??
        typeDirectiveArgumentMaps[typeName];

      if (authDirective) {
        const { requires } = authDirective;
        if (requires) {
          const { resolve = defaultFieldResolver } = fieldConfig;

          fieldConfig.resolve = async function (source, args, context: GraphQLContext, info) {
            if (!context.auth.user) {
              throw new GraphQLError(context.req.t("authenticationError"), {
                extensions: { code: "UNAUTHENTICATED" },
              });
            }

            if (
              (requires as string).toLowerCase() === UserRole.Admin &&
              context.auth.user?.role !== UserRole.Admin
            ) {
              throw new GraphQLError(context.req.t("authorizationError"), {
                extensions: { code: "UNAUTHORIZED" },
              });
            }

            return await resolve(source, args, context, info);
          };
          return fieldConfig;
        }
      }

      return fieldConfig;
    },
  });
}
