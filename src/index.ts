import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { readFileSync } from "fs";
import Fastify from "fastify";
// import postgres from "postgres";
import { createPool } from "slonik";
// import { createPostgresBridge } from "postgres-bridge";
import { ApolloServer } from "@apollo/server";
import fastifyApollo, { fastifyApolloDrainPlugin } from "@as-integrations/fastify";
import compress from "@fastify/compress";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

import { resolvers } from "./adapters/resolvers";
import { createContextFactory, GraphQLContext } from "./utilities/context";
import { createQueryLoggingInterceptor } from "slonik-interceptor-query-logging";

const envConfig = dotenv.config();
dotenvExpand.expand(envConfig);

const typeDefs = readFileSync("./schema.graphql", { encoding: "utf-8" });

const fastify = Fastify({ logger: true });

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const apollo = new ApolloServer<GraphQLContext>({
  introspection: process.env.NODE_ENV !== "production",
  typeDefs,
  resolvers,
  plugins: [fastifyApolloDrainPlugin(fastify)],
});

console.log(process.env.NODE_ENV);

await fastify.register(rateLimit);
await fastify.register(helmet, {
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
});
await fastify.register(cors);
await fastify.register(compress);

const interceptors = [createQueryLoggingInterceptor()];
// const PostgresBridge = createPostgresBridge(postgres);
const pool = await createPool(process.env.DATABASE_URL || "", {
  maximumPoolSize: parseInt(process.env.DATABASE_POOL_SIZE || "10"),
  connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || "1000"),
  idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || "1000"),
  interceptors,
});

await apollo.start();
await fastify.register(fastifyApollo(apollo), { context: createContextFactory(pool) });

const url = await fastify.listen({
  port: 4000,
  host: "0.0.0.0",
});

console.log(`🚀  Server ready at: ${url}`);
