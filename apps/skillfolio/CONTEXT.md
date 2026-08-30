# Skillfolio

Skillfolio is a curated library for discovering, evaluating, and installing reusable instructions for AI coding agents.

## Language

**Skill**:
A reusable instruction package for AI coding agents, represented in Skillfolio by stable catalog facts and linked source documentation.
_Avoid_: Tool, plugin, capability

**Skill catalog**:
The generated, file-backed collection of Skills published by Skillfolio. It is a runtime projection, not an editing authority.
_Avoid_: Marketplace, registry, database

**Managed skill facts**:
Release and distribution facts owned by the monorepo root catalog, including version, package, repository, provenance, and license status.
_Avoid_: Display metadata, card copy

**Presentation metadata**:
Skillfolio-owned labels, category, featured state, summaries, descriptions, and common uses.
_Avoid_: Package metadata, release source

**Compatibility evidence**:
Dated facts that distinguish documented Agent Skills format support, installer-path tests, and live host runtime verification. A documented host is not automatically runtime-verified.
_Avoid_: Works everywhere, universally compatible

**Category**:
The single primary problem domain a Skill helps a user solve. Categories follow outcomes rather than providers, file formats, implementation technologies, or vague maintenance activity.
_Avoid_: Tag, platform, feature list

Canonical categories are API Quality, Deployment, Documentation, Frontend Quality, Release Engineering, Repository Management, and Web Visibility.

**External skill facts**:
Source and installation facts for a Skill maintained outside this monorepo.
_Avoid_: Managed skill override

**Repository README**:
The source documentation associated with a Skill and displayed on its detail page.
_Avoid_: Article, local documentation, catalog description

**Publishing metadata**:
The canonical site and page facts Skillfolio exposes to search crawlers and social platforms.
_Avoid_: SEO copy, page configuration, crawler settings
