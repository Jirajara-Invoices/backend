import { readFileSync } from "fs";
import http from "http";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import expressSession from "express-session";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compress from "compression";
import cors from "cors";
import helmet from "helmet";
import { doubleCsrf } from "csrf-csrf";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import { RateLimiterRedis } from "rate-limiter-flexible";
// import postgres from "postgres";
import { createPool } from "slonik";
// import { createPostgresBridge } from "postgres-bridge";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";

import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers } from "./adapters/resolvers";
import { createContextFactory, GraphQLContext } from "./utilities/context";
import { createQueryLoggingInterceptor } from "slonik-interceptor-query-logging";
import { createAuthDirective } from "./utilities/auth";
import { morganMiddleware } from "./utilities/morgan";
import { generatePDF } from "./adapters/controllers/generatePDF";

const envConfig = dotenv.config();
dotenvExpand.expand(envConfig);

const COOKIES_SECRET = process.env.COOKIES_SECRET || "";
const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME || "x-csrf-token";

const typeDefs = readFileSync("./schema.graphql", { encoding: "utf-8" });
const isProduction = process.env.NODE_ENV === "production";

const redis = new Redis({
  enableAutoPipelining: true,
});
const RedisStore = connectRedis(expressSession);
const store = new RedisStore({
  client: redis as any,
});

const app = express();
const httpServer = http.createServer(app);

const schema = createAuthDirective(
  makeExecutableSchema({
    typeDefs,
    resolvers,
  }),
  "auth",
);

const plugins = [ApolloServerPluginDrainHttpServer({ httpServer })];

!isProduction &&
  plugins.push(
    ApolloServerPluginLandingPageLocalDefault({
      includeCookies: true,
    }),
  );

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const apollo = new ApolloServer<GraphQLContext>({
  introspection: !isProduction,
  schema,
  plugins,
  csrfPrevention: true,
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
  rateLimiter
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).send("Too Many Requests");
    });
};

app.use(rateLimiterMiddleware);
app.use(morganMiddleware);
app.use(
  helmet({
    contentSecurityPolicy: isProduction,
    crossOriginResourcePolicy: isProduction,
  }),
);
app.use(compress());
app.use(
  expressSession({
    name: "session_id",
    secret: process.env.SESSION_SECRET || "",
    saveUninitialized: false,
    resave: false,
    store: store,
    cookie: {
      path: "/",
      maxAge: parseInt(process.env.SESSION_MAX_AGE || "31536000"),
      sameSite: "lax",
      secure: isProduction,
      httpOnly: isProduction,
    },
  }),
);
!isProduction && app.set("trust proxy", 1);

const interceptors = [createQueryLoggingInterceptor()];
// const PostgresBridge = createPostgresBridge(postgres);
const pool = await createPool(process.env.DATABASE_URL || "", {
  maximumPoolSize: parseInt(process.env.DATABASE_POOL_SIZE || "10"),
  connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || "1000"),
  idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || "1000"),
  interceptors,
});

await apollo.start();

const { invalidCsrfTokenError, generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: (req) => req?.secret || "",
  cookieName: CSRF_COOKIE_NAME,
  cookieOptions: {
    sameSite: isProduction ? "lax" : "none",
    secure: isProduction,
    signed: true,
  },
});
app.use(cookieParser(COOKIES_SECRET));

// Deactivate temporally on development because GraphQL clients do not support CSRF tokens automatically
isProduction && app.use(doubleCsrfProtection);

const csrfGenerateHandler: RequestHandler = (req, res, next) => {
  if (isProduction && req.method === "GET") {
    generateToken(res, req);
  }

  next();
};

const csrfErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error == invalidCsrfTokenError) {
    res.status(403).json({
      error: error,
    });
  } else {
    next();
  }
};

app.use(
  "/graphql",
  cors<cors.CorsRequest>({
    credentials: true,
  }),
  bodyParser.json(),
  csrfGenerateHandler,
  csrfErrorHandler,
  expressMiddleware(apollo, {
    context: createContextFactory(pool, redis),
  }),
);

app.use(
  "/download-invoice/:id",
  cors<cors.CorsRequest>({}),
  bodyParser.json(),
  csrfGenerateHandler,
  csrfErrorHandler,
  generatePDF(pool, redis),
);

await new Promise<void>((resolve) => httpServer.listen({ port: 4000, host: "0.0.0.0" }, resolve));

// eslint-disable-next-line no-console
console.log(`🚀 Server ready at http://0.0.0.0:4000/`);
