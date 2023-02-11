import { logger } from "./winston";
import morgan from "morgan";

const stream = {
  write: (message: string) => logger.http(message),
};

const skip = () => {
  const env = process.env.NODE_ENV || "development";
  return env !== "development";
};

export const morganMiddleware = morgan(
  ":remote-addr :method :url :status :res[content-length] - :response-time ms",
  { stream, skip },
);
