import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-ride-history.ts';
import '@/ai/flows/fare-estimate-from-prompt.ts';