import dotenv from "dotenv";

dotenv.config();

export class envVars {
  FILESYSTEM =
    process.env.FILESYSTEM === undefined ? "abc123" : process.env.FILESYSTEM;
  TOKEN = process.env.TOKEN === undefined ? "pass" : process.env.TOKEN;
}
