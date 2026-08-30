# Contributing

Open a focused issue before substantial behavior changes. Keep crawler and framework claims tied to reproducible evidence.

## Local verification

```sh
npm install
npm test
npm run pack:check
```

Add regression coverage for checker or installer changes. Do not weaken a finding merely to make one platform-specific example pass. Document platform variability as a limitation instead.
