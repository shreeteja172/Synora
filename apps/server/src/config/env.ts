import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
  override: true,
});

// console.log(process.cwd());
// console.log(process.env.DATABASE_URL);