import 'dotenv/config';
import {runAgent} from './agent.js';

runAgent().catch((error) => {
  console.error('Agent failed:', error);
  process.exit(1);
});
