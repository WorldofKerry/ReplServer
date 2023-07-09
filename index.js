import { serve } from "./src/server.js";
import { envVars } from "./src/envVars.js";

serve({ envVars: new envVars() });
