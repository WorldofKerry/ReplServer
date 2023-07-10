import dotenv from "dotenv";

dotenv.config();

const ENV_VARS = {
  FILESYSTEM:
    process.env.FILESYSTEM === undefined ? "abc123" : process.env.FILESYSTEM,
  TOKEN: process.env.TOKEN === undefined ? "pass" : process.env.TOKEN,
};

export class envVars {
  getFileSystemPassword() {
    return ENV_VARS.FILESYSTEM;
  }

  getApiToken() {
    return ENV_VARS.TOKEN;
  }

  getFileSystem;
}
