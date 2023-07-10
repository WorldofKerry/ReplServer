import dotenv from "dotenv";

dotenv.config();

function getEnvWithDefaults(key) {
  return process.env[key] === undefined ? "DEFAULT_PASSWORD" : process.env[key];
}

const ENV_VARS = {
  FILESYSTEM: getEnvWithDefaults("FILESYSTEM"),
  TOKEN: getEnvWithDefaults("TOKEN"),
};

export class envVars {
  getStoragePassword() {
    return ENV_VARS.FILESYSTEM;
  }

  getApiToken() {
    return ENV_VARS.TOKEN;
  }

  getFileSystem;
}
