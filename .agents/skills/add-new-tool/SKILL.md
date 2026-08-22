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
