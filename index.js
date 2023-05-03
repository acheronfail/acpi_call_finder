#!/usr/bin/env node

import fs from 'fs';

if (process.geteuid() !== 0) {
  console.error("This script must be run as root!");
  process.exit(1);
}

const ACPI_CALL = "/proc/acpi/call";
// it seems both of these work, not sure if there's any difference
const PREFIXES = ["_SB_", "_SB"];
// got these from all the existing entries in acpi_call's example script
// see: https://github.com/mkottman/acpi_call/blob/master/examples/turn_off_gpu.sh
const SUFFIXES = [
  "ATPX",
  "DGOF",
  "DOFF",
  "OFF",
  "P3MO",
  "PX02",
  "SGOF",
  "XTPX",
  "_OFF",
  "_PS3",
  "_T_0",
];

function call(name) {
  for (const pre of PREFIXES) {
    for (const post of SUFFIXES) {
      const method = "\\" + [pre, name, post].join(".");
      console.log(`Attempting: ${method}...`);
      fs.writeFileSync(ACPI_CALL, method, "utf8");
      const result = fs.readFileSync(ACPI_CALL, "utf8");
      console.log(`Result: ${result}`);
      if (!result.toLowerCase().includes("error")) {
        console.log(`\n\nSUCCESS WITH: ${method}\n\n`);
      }
    }
  }
}

const args = process.argv.slice(2);
if (args.length == 0) {
  console.log("Please pass at least one name to try");
  process.exit(1);
}

for (const arg of args) {
  call(arg);
}
