import { serve } from "./server.js";
import { envVars } from "./envVars.js";

serve({ envVars: new envVars() });
