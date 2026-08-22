# Pull Request

## Description
<!-- What does this PR do? Link the issue: Closes #123 -->

## Type of Change
<!-- Check all that apply -->
- [ ] New tool
- [ ] Bug fix
- [ ] Feature / enhancement
- [ ] Docs / guides
- [ ] Chore (deps, CI, config)
- [ ] Refactor / performance

## Tool Checklist (if adding/updating a tool)
- [ ] Component created under `src/components/<domain>/` and uses `ToolPageLayout`
- [ ] Entry added to `src/toolCategories.json` (`name`, `link`, `iconName`, `description`, `isEnabled`)
- [ ] Lazy route added in `src/routers.jsx` (`React.lazy` + `Suspense`)
- [ ] URL query params supported for instant compute (`useSearchParams`)
- [ ] Raw output supported where applicable (`?raw=text|json|csv|xml|yaml|image|svg` + `/raw/:toolSlug`)
- [ ] `DeveloperEmbedGuide` wired (cURL / iframe / img / React / Markdown snippets)
- [ ] Sitemaps regenerated: `python3 generateSiteMap.py -f src/routers.jsx`

## QA
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Tested on desktop + mobile viewport
- [ ] Tested light + dark theme
- [ ] Tested `?raw=` / `/raw/` and `/embed/` variants (if applicable)
- [ ] No secrets committed (`src/firebaseConfig.json` stays git-ignored)

## Screenshots / Recording
<!-- Add before/after screenshots or a short screen recording for UI changes -->

## Related Issues
<!-- Closes #..., Related to #... -->

## Additional Notes
<!-- Anything reviewers should know -->
