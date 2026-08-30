#!/usr/bin/env node

import { runInstaller } from "./installer-runtime.js";

runInstaller({
  "skillName": "make-app-netlify-ready",
  "errorStatus": 1,
  "legacyNames": [],
  "forceMigratesLegacy": false
}, import.meta.url);
