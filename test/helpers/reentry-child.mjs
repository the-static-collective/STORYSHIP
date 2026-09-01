import { verifyVoyageBundleCanonical } from '../../src/verify.mjs';
const directory=process.argv[2];
if (directory) process.stdout.write(`${await verifyVoyageBundleCanonical(directory)}\n`);
