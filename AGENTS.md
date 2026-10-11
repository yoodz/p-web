# AGENTS.md

This repository is a Umi + Ant Design Pro frontend app written in TypeScript. The intent is to keep changes aligned with the existing Pro Components conventions and the project’s route/service structure.

## Quick start

- Install dependencies: `npm install`
- Start dev server: `npm run dev` or `npm run start:dev`
- Build: `npm run build`
- Test: `npm run test`
- Type check: `npm run tsc`
- Lint: `npm run lint`

## Project structure

- App and route entry: [src/app.tsx](src/app.tsx), [config/routes.ts](config/routes.ts)
- Pages: [src/pages](src/pages)
- Shared services and API hooks: [src/services](src/services)
- Global styles: [src/global.less](src/global.less), [src/global.style.ts](src/global.style.ts)
- Type declarations: [types/index.d.ts](types/index.d.ts)
- Documentation: [README.md](README.md)

## Conventions to follow

- Prefer the existing Ant Design Pro / Umi patterns already used in the project instead of introducing a new state management pattern.
- Route definitions live in [config/routes.ts](config/routes.ts). When adding new pages, update the route config and keep route names/icons consistent with the current menu structure.
- Page components generally live under [src/pages](src/pages) and use Ant Design Pro components such as `ProTable`, `PageContainer`, `ProDescriptions`, and `FooterToolbar`.
- API calls should be placed under the service modules in [src/services](src/services) and called from page-level hooks or `useRequest` calls.
- Keep UI text and labels consistent with the existing Chinese/English style used in the app.
- Prefer small, focused component changes; do not rework unrelated architecture unless required by the task.
- TypeScript types should be reusable and consistent with the `API.*` global namespace used throughout the app.

## Validation

Before considering work complete:

1. Run the smallest relevant validation command for the changed behavior.
2. Prefer `npm run tsc` for type safety.
3. For UI changes, use `npm run test` or the related targeted test when available.
4. When code generation or refactors touch multiple files, keep the change scoped and consistent with the existing project style.

## Notes

- The app uses Umi Max and Ant Design Pro components, so project conventions are framework-driven.
- Mock data and dev-only behavior live under [mock](mock) and are useful when reproducing or validating page behavior.
- This repository is a frontend app; do not assume a backend service is available unless explicitly present in the project.
