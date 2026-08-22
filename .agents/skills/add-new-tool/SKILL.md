---
name: add-new-tool
description: >-
  Developer guide and step-by-step instructions for adding a new tool to the rajlab-tools-webapp project.
---

# Adding a New Tool to Rajlab Tools

Follow these steps to add a new tool to the application:

1.  **Create the Component**: 
    - Create a new folder (if needed) and a `.tsx` or `.jsx` file inside `src/components/`.
    - Build your tool component. Make it feature-rich with a clean Tailwind UI.
    - Ensure your component respects dark mode (e.g. using `useTheme()` and styling accordingly).

2.  **Add Breadcrumbs**:
    - Import and include the `Breadcrumbs` component at the top of your tool's UI wrapper.
    - Example: `<Breadcrumbs crumbs={[{ name: 'Home', link: '/' }, { name: 'Category Name', link: '/category' }, { name: 'Tool Name' }]} />`

3.  **Update Routing**:
    - Open `src/routers.jsx`.
    - Import your component lazily: `const MyNewTool = lazy(() => import('./components/MyNewTool'));`
    - Add a new route object to the `children` array under the main layout route. Example: `{ path: "my-new-tool", element: <S fallback={<Loading/>}><MyNewTool /></S> }`

4.  **Register the Tool (toolCategories.json)**:
    - Open `src/toolCategories.json`.
    - Find the appropriate category or create a new one.
    - Add a JSON entry describing the tool. Make sure to use descriptive names for better search visibility.
    - Example:
      ```json
      {
        "name": "Detailed Searchable Tool Name",
        "link": "/my-new-tool",
        "iconName": "FaWrench",
        "isEnabled": true,
        "description": "A detailed description explaining what the tool does and what features it provides."
      }
      ```

5.  **Follow Project Conventions**:
    - Use Tailwind for styling.
    - Keep all logic client-side (no server endpoints).
    - Add descriptive names, good metadata, and avoid basic UI. Provide rich controls for the user.

5a. **Register Telemetry & Firestore (MANDATORY for discoverability)**:
    - **Whitelist the slug in `firestore.rules`** — add your new `"/my-new-tool"` slug (without leading slash, e.g. `"my-new-tool"`) to `isValidSlug()` array. This is required; otherwise `incrementToolUsage()` writes are rejected by security rules and community counts stay at 0.
    - **Tool Registry** — if your tool has URL query params / embed modes, add an entry to `src/utils/toolRegistry.js` (`TOOL_REGISTRY["/my-new-tool"] = { title, sourceFile, category, queryParams }`) so `ToolRouteTracker` can auto-count it and embeds work.
    - **No index change needed** for `tool_usage` (single-field `count` is auto-indexed). Only add to `firestore.indexes.json` if you introduce a new composite query (e.g. filtering `feedback` by new fields).
    - **App Check:** No code change needed — `src/firebaseConfig.jsx` auto-attaches reCAPTCHA Enterprise token if `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` is set. Ensure `firestore.rules` keeps `request.app != null` for `feedback`/`tool_usage` writes.
    - After editing rules, deploy: `npx firebase deploy --only firestore --project portfolio-site-ba08a` (or paste `firestore.rules` in Console → Firestore → Rules → Publish).

6.  **Update Changelog & Version (MANDATORY)**:
    - Open `public/CHANGELOG.md` and add a new entry under the latest release section (or bump version).
    - Write in a **public-facing, user-friendly tone** highlighting key capabilities and user benefits.
    - Synchronize `"version"` in `package.json` if bumping the release version.

