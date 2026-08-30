#!/usr/bin/env node

import { runInstaller } from "./installer-runtime.js";

runInstaller({
  "skillName": "fix-social-link-previews",
  "errorStatus": 1,
  "legacyNames": [],
  "forceMigratesLegacy": false
}, import.meta.url);
