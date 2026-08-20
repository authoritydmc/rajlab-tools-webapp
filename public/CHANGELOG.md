# Changelog

All notable changes to Rajlab Tools Webapp will be documented in this file.

## [2.1.0] - 2026-08-21
### Added
- **Dynamic Sorting**: Added auto-sorting by most used tools and custom category reordering based on local storage.
- **Changelog Link**: Added a direct link to the changelog in the footer for better visibility.
- **Hover Animations**: Added dynamic, random hover effects to tool cards to improve interactivity.
- **Global Error Handling**: Introduced graceful error boundaries across the application with auto-refresh and quick-copy stack traces.
- **Breadcrumb Navigation**: Added intelligent dropdowns inside tool pages to easily jump between related tools.

### Changed
- **Masonry Layout**: Migrated the homepage tool grid to a true masonry layout to eliminate empty vertical gaps.
- **Bento Grid**: Restored the category bento grid while keeping modern wide tool cards.
- **Responsive Ultrawide Support**: Standardized all 40+ tool pages to a responsive, full-width layout.
- **UI Simplification**: Removed the double card visual effect for a cleaner, seamless list design inside categories.
- **Category Reordering**: Repositioned PDF Tools to the top and Excel Tools under Developer Tools for better discoverability.
- **Performance**: Switched category data loading to synchronous imports for instant initial renders.
- **SEO**: Updated and regenerated sitemaps.

### Fixed
- **Transparent Backgrounds**: Made tool backgrounds transparent to allow the animated mesh gradient to shine through properly.
- **Mesh Background**: Fixed the mesh background attachment so the animated gradient stays consistently visible on long pages.
- **Grid Stretching**: Stopped grid items from artificially stretching vertically in the masonry layout.



## [1.4.0] - 2026-02-01
### Changed
- **Tool Categories:** Updated tool categories and disabled features that are not yet implemented.

## [1.3.0] - 2025-08-23
### Added
- **JWT Decoder:** Added a powerful JWT Decoder component with byte size calculation, signature verification, and local/UTC epoch date formatting.
- **Auto-Paste Functionality:** Implemented auto-paste from clipboard for JWTs.
- **Improved Display:** Enhanced the JWT display with a table format and JSON syntax highlighting.
- **JSON Utilities:** Added comprehensive JSON utility tools.

## [1.2.0] - 2024-10-15
### Added
- **WhatsApp QR Generator:** Implemented a new WhatsApp QR message generator.

### Changed
- **UI Rewrite:** Significant rewrite and optimization of core components.
- **Header:** Adjusted header sizing for better responsiveness.

### Fixed
- **Navigation:** Fixed the double WhatsApp link issue in the JSON definitions.
- **List View:** Fixed an issue where disabled tools were still clickable in the list view.

## [1.1.0] - 2024-10-11
### Added
- **Media Converter (WIP):** Started foundational work for a video/media converter.
- **Default Categories:** Tools now default to category view instead of list view.

### Fixed
- **Disabled Tools:** Fixed a bug where disabled tools remained clickable.

## [1.0.1] - 2024-10-09
### Changed
- **Cost Estimator:** Updated print rates and hid ink cost details when not applicable.

## [1.0.0] - 2024-10-07
### Added
- **Homepage Redesign:** Redesigned the homepage style in category view using a stagger layout.
- **Share Functionality:** Added a share button in the Print Cost Estimator (PCE) QR.
- **Brand Assets:** Updated favicons, logos, and header font for a refreshed look.

### Fixed
- **Cost Calculator:** Fixed a bug where color print ink cost did not include the black ink cost.
- **Currency Bug:** Fixed an issue where the currency unit was not defaulting to Indian Rupees when not set initially, and improved the resetting logic.
- **UI Tweaks:** Added appropriate padding when the print settings panel is opened.
- **Cleanup:** Removed leftover console logs for cleaner production code.
