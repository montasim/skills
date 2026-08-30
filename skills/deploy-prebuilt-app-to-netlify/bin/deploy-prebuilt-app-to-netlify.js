#!/usr/bin/env node

import { runInstaller } from "./installer-runtime.js";

runInstaller({
  "skillName": "deploy-prebuilt-app-to-netlify",
  "errorStatus": 1,
  "legacyNames": [],
  "forceMigratesLegacy": false
}, import.meta.url);
