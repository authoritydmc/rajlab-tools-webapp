# Changelog

All notable changes to Rajlab Tools Webapp will be documented in this file.

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
