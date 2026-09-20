#!/usr/bin/env node
// Manual crossings only; never launch ELF, authorize effects, or select storage.
import { sealElfArk, verifyElfArk, receiveElfArk } from '../src/elf-ark.mjs';

const [command,...args] = process.argv.slice(2);
const option = name => {
  const matches = args.map((x,i) => x===name ? i : -1).filter(i=>i>=0);
  if (matches.length!==1 || matches[0]+1>=args.length || args[matches[0]+1].startsWith('--')) {
    throw new Error(`exactly one ${name} PATH required`);
  }
  return args[matches[0]+1];
};
try {
  let result;
  if (command==='seal') {
    result = await sealElfArk({occurrence:option('--occurrence'),destination:option('--destination')});
  } else if (command==='verify') {
    result = (await verifyElfArk(option('--ark'))).ark;
  } else if (command==='receive') {
    result = await receiveElfArk({arkDirectory:option('--ark'),destination:option('--destination')});
  } else throw new Error('usage: node cli/elf-ark.mjs seal --occurrence DIR --destination NEW_DIR | verify --ark DIR | receive --ark DIR --destination NEW_DIR');
  process.stdout.write(`${JSON.stringify(result)}\n`);
} catch(error) {
  process.stderr.write(`REFUSE: ${error.code ?? error.message}\n`);
  process.exitCode=2;
}
