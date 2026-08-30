# Agent Skill quality standard

Status: adopted, 2026-08-30

This repository evaluates a skill as a small product interface, not merely a valid `SKILL.md` file. The baseline combines the [open Agent Skills specification](https://agentskills.io/specification), [OpenAI's Codex skill guidance](https://developers.openai.com/codex/build-skills), [Claude Code's skill guidance](https://code.claude.com/docs/en/slash-commands), and the repository's own safety and evidence requirements.

## Evidence levels

Compatibility and quality claims must use one of these levels:

- **Runtime verified:** the host discovered or executed the skill in an isolated probe.
- **Installer verified:** an automated test installed the complete portable payload into the host's documented location.
- **Format verified:** the skill passes structural validation and uses only the shared Agent Skills contract for behavior.
- **Documented:** current official host documentation establishes support, but this repository did not run that host.
- **Unverified:** evidence is missing, blocked, or depends on an unavailable tool or account.

Do not collapse these levels into a generic “supports” claim.

## Quality dimensions

### 1. Specification correctness

A passing skill must:

- use a lowercase kebab-case name of at most 64 characters;
- match the name of its containing directory;
- begin with YAML frontmatter containing `name` and `description`;
- keep portable behavior in standard fields and Markdown;
- use only supported shared frontmatter fields; declare `license` when it reflects the actual grant;
- state runtime prerequisites in the skill body and dated repository evidence rather than inventing a shared frontmatter key;
- reference resources by portable, skill-relative paths;
- keep host-only presentation or policy metadata outside the portable behavior contract.

`agents/openai.yaml` may describe the OpenAI interface. It must not be required for the skill to work in another host.

### 2. Discovery quality

The description is the routing interface. It must:

- state the primary outcome first;
- include likely user trigger language;
- name the nearest non-goal or neighboring skill when confusion is plausible;
- put the job and primary boundary within the first 250 characters where practical;
- avoid provider names unless the provider is part of the actual job;
- remain materially distinct from every other description in this repository.

Every skill should have at least these prompt probes:

1. a clear positive trigger;
2. a clear negative prompt for its nearest neighbor;
3. an ambiguous prompt that should cause a bounded assumption or question;
4. a request that crosses an authorization boundary;
5. an unavailable-tool or unavailable-runtime case.

### 3. One coherent job

A skill should expose one outcome-oriented interface. Audit and repair may remain together when they share the same evidence, concepts, and verification loop. Preparation and remote mutation should separate when they have different authorization, failure, or rollback contracts.

Keep a skill when removing it would force callers to understand substantial domain policy. Merge it when it is only a pass-through or duplicate checklist. Split it when independent outcomes have different users, authorization, tooling, or completion criteria.

An orchestration skill is justified only when it adds sequencing, state recovery, and authority management. It should route to specialized skills or shared deterministic modules instead of reimplementing their full procedures.

### 4. Complete workflow contract

The loaded instructions must establish:

- accepted inputs and how to resolve missing context;
- evidence precedence and authoritative sources;
- ordered execution steps;
- mutation and external-action boundaries;
- failure handling and retry limits;
- verification proportional to risk;
- a concrete output or handoff contract;
- conditions under which success must not be claimed.

Imperative, checkable instructions are preferred over broad advice.

### 5. Safety and authority

Every skill that can mutate files or external state must distinguish:

- read-only inspection;
- local reversible edits;
- commits and pushes;
- package publication;
- repository or release mutation;
- deployment or catalog mutation;
- destructive or difficult-to-reverse operations.

Authorization applies only to the named target and action. A skill must preserve unrelated work, avoid secrets, report partial success, and stop when identity or ownership is materially ambiguous.

### 6. Progressive disclosure

`SKILL.md` should contain the stable workflow, constraints, and output contract. Detailed standards, framework matrices, examples, schemas, and volatile provider facts belong in focused references loaded only by the applicable branch.

The repository target is:

- well below the specification's 500-line recommendation;
- normally below 5,000 words for the loaded skill body;
- references only one level deep;
- no duplicated policy between the body and references unless the repetition is a safety-critical invariant.

Mandatory references must justify their context cost. A large example should not be loaded for every invocation when only complex cases need it.

### 7. Portable execution

Portable skills must:

- avoid hard-coded Codex, Claude, Gemini, Antigravity, ZCode, Cursor, Copilot, or OpenCode installation paths in workflow behavior;
- resolve bundled scripts relative to the loaded `SKILL.md`;
- use runtime-neutral language such as “the available browser” or “the repository's package manager” where appropriate;
- state actual system prerequisites in portable documentation;
- isolate host extensions rather than placing them in shared frontmatter;
- avoid assuming that every host exposes the same invocation syntax, approval UI, subagents, browser, or network access.

A model provider and a skill host are different layers. For example, using a Z.ai model through Claude Code does not create a separate skill format; the Claude Code host contract still governs discovery and tools.

### 8. Deterministic resources

Bundled scripts should be used when they improve repeatability. Each executable helper must:

- be self-contained or declare its dependencies;
- support clear usage or `--help` where it is user-facing;
- return documented exit states;
- validate paths and inputs before mutation;
- avoid exposing credentials or sensitive values;
- handle missing tools, timeouts, and partial remote evidence;
- have focused tests for normal, edge, and failure cases.

Tests must remove their temporary fixtures. A green assertion suite that leaks enough files to break later checks is not healthy.

### 9. Distribution truthfulness

For each skill, distinguish:

- canonical source availability;
- legal reuse permission;
- package or plugin distribution;
- supported installer targets;
- documented manual installation;
- catalog presentation claims;
- runtime verification.

Source-only or unlicensed skills must not be advertised as generally installable open-source releases. Existing npm package names may remain stable when an installed skill was renamed, but documentation must make that mapping obvious.

### 10. Maintenance and evidence freshness

Version-sensitive provider, framework, registry, browser-extension, and deployment rules must link to primary documentation and record a review date when copied into a reference. The instructions must tell the agent to recheck current official documentation when installed versions or observed behavior exceed the recorded evidence.

## Verdicts

- **Ready:** focused, safe, portable, verified, and truthfully distributed.
- **Ready with targeted revisions:** the core interface is sound; bounded discovery, test, context, or distribution work remains.
- **Needs redesign:** the interface overlaps materially, duplicates specialists, or lacks enough evidence to be dependable.
- **Do not distribute:** unsafe, legally unavailable for reuse, misleading, or not yet validated. The skill may still remain private and source-only.

## Repository acceptance gate

A portfolio-wide quality check should fail when:

- canonical names and directories disagree;
- descriptions exceed the specification or do not establish a distinct trigger;
- a resource link is missing;
- host-only frontmatter enters the shared contract;
- declared host compatibility lacks either official documentation or runtime/install evidence;
- a packaged script has no representative behavioral test;
- temporary test fixtures are left behind;
- a catalog claims a host or license that the source and distribution evidence do not support;
- an orchestration skill silently duplicates or broadens a specialized skill's authority.
