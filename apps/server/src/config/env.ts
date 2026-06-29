import dotenv from "dotenv";
import path from "path";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.prod"
    : ".env.local";

dotenv.config({
  path: path.join(process.cwd(), envFile),
  override: false,
});

console.log(`Loaded env file: ${envFile}`);