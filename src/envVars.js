import dotenv from "dotenv";

dotenv.config();

export class envVars {
  FILESYSTEM =
    process.env.FILESYSTEM === undefined ? "abc123" : process.env.FILESYSTEM;
  TOKEN = process.env.TOKEN === undefined ? "pass" : process.env.TOKEN;

//   getEnvVars() {
//     let envVars = {};
//     for (const key of KEYS) {
//       envVars[key] = process.env[key];
//       if (envVars[key] === undefined) {
//         envVars[key] = "pass";
//       }
//     }
//     return envVars;
//   }
}
