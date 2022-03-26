import dotenv from "dotenv";
import env from "env-var";
dotenv.config();

export const KRAKEN_API_KEY = env.get("KRAKEN_API_KEY").required().asString();
export const KRAKEN_PRIVATE_KEY = env
  .get("KRAKEN_PRIVATE_KEY")
  .required()
  .asString();
