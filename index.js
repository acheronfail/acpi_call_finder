#!/usr/bin/env node

import fs from 'fs';

if (process.geteuid() !== 0) {
  console.error("This script must be run as root!");
  process.exit(1);
}

const ACPI_CALL = "/proc/acpi/call";
// it seems both of these work, not sure if there's any difference
const PREFIXES = ["\\_SB_", "\\_SB"];
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

const getMaxLength = strs => strs.map(s => s.length).reduce((a, x) => Math.max(a, x), 0);
const prePostMaxLen = getMaxLength(PREFIXES) + getMaxLength(SUFFIXES);

function call(input) {
  // accept the prefixes since that's the format users will probably find these names in
  // but remove them, so we can try our own
  const name = input.replace(/^\\?_SB_?./g, '');

  // calculate max length of a generated method, used only for printing to the terminal
  const pad = name.length + prePostMaxLen + 2;

  // go through each combination and see if we find a match
  for (const pre of PREFIXES) {
    for (const post of SUFFIXES) {
      const method = [pre, name, post].join(".");
      const padding = ' '.repeat(pad - method.length);
      process.stdout.write(`${method}: ${padding}`);

      // call acpi with method ...
      fs.writeFileSync(ACPI_CALL, method, "utf8");
      // ... check result
      const result = fs.readFileSync(ACPI_CALL, "utf8");

      console.log(`Result: ${result}`);
      if (!result.toLowerCase().includes("error")) {
        console.log(`\nSUCCESS WITH: "${method}"\n`);
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
