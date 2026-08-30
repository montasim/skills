#!/usr/bin/env node

import { runInstaller } from "./installer-runtime.js";

runInstaller({
  "skillName": "publish-verified-github-release",
  "errorStatus": 2,
  "legacyNames": [],
  "forceMigratesLegacy": false
}, import.meta.url);
