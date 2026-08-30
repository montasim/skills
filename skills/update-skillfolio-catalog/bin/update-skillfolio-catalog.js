#!/usr/bin/env node

import { runInstaller } from "./installer-runtime.js";

runInstaller({
  "skillName": "update-skillfolio-catalog",
  "errorStatus": 1,
  "legacyNames": [],
  "forceMigratesLegacy": false
}, import.meta.url);
