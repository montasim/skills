#!/usr/bin/env node

import { runInstaller } from "./installer-runtime.js";

runInstaller({
  "skillName": "fix-project-metadata-mismatches",
  "errorStatus": 2,
  "legacyNames": [],
  "forceMigratesLegacy": false
}, import.meta.url);
