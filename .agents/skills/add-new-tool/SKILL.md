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

5a. **Register Telemetry & Firestore (auto — no rules deploy needed)**:
     - **No `firestore.rules` edit needed** — `tool_usage` now uses a pattern check `isValidSlug()` (`^[a-z0-9-]{2,60}$`, 2–60 chars) instead of a hardcoded whitelist, and App Check is enforced at the API layer (Firebase Console → App Check → Cloud Firestore → Enforced). Any `slug` matching the pattern auto-creates/updates `tool_usage/{slug}` via `incrementToolUsage()` with no manual publish. Keep your link slug lowercase-kebab-case.
     - **Tool Registry** — if your tool has URL query params / embed modes, add an entry to `src/utils/toolRegistry.js` (`TOOL_REGISTRY["/my-new-tool"] = { title, sourceFile, category, queryParams }`) so `ToolRouteTracker` can auto-count it and embeds work.
     - **No index change needed** for `tool_usage` (single-field `count` is auto-indexed). Only add to `firestore.indexes.json` if you introduce a new composite query (e.g. filtering `feedback` by new fields).
     - **App Check:** No code change needed — `src/firebaseConfig.jsx` auto-attaches reCAPTCHA v3 token (`ReCaptchaV3Provider` `6LfUX5MtAAAAAKfkcweTqd2WFjR2t_x2jliJu9-p`). Enforcement is console-level; rules no longer use `request.app`.

6.  **Update Changelog & Version (MANDATORY)**:
    - Open `public/CHANGELOG.md` and add a new entry under the latest release section (or bump version).
    - Write in a **public-facing, user-friendly tone** highlighting key capabilities and user benefits.
    - Synchronize `"version"` in `package.json` if bumping the release version.

