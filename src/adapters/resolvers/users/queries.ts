import { FindUserInput } from "../../../usecases/users/interfaces";
import { GraphQLContext } from "../../../utilities/context";
import { ConnectionArgs, generateConnection, mapGenericFilters } from "../../../utilities/relay";
import { GraphQLError } from "graphql/error";

type UserGraphQLFilterInput = {
  name?: string;
  email?: string;
};

function mapCursorArgsToFindUserInput(args: ConnectionArgs<UserGraphQLFilterInput>): FindUserInput {
  const input: FindUserInput = mapGenericFilters(args);

  input.name = args.filter.name;
  input.email = args.filter.email;

  return input;
}

export const userQueryResolvers = {
  user: async (_: any, { id }: { id: string }, { useCases }: GraphQLContext) => {
    const useCase = useCases.users;

    return await useCase.findByID(id);
  },
  users: async (
    _: any,
    args: ConnectionArgs<UserGraphQLFilterInput>,
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.users;
    const input = mapCursorArgsToFindUserInput(args);

    const users = await useCase.findAll(input);

    return generateConnection(
      "User",
      users,
      {
        endCursor: users.length > 0 ? users[users.length - 1].created_at : undefined,
        startCursor: users.length > 0 ? users && users[0].created_at : undefined,
        hasNextPage: users.length === input.limit,
        hasPreviousPage: input.cursor !== undefined,
      },
      users.length,
    );
  },
  currentUser: async (_: any, __: any, { auth }: GraphQLContext) => {
    if (!auth.user) {
      throw new GraphQLError("Not authenticated", {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      });
    }
    return auth.user;
  },
};
