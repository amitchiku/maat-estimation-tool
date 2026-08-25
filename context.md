# Project Context & Session Progress Checkpoint

## Project Overview
Sycamore Design Build Estimation Tool — a Vue 3, Vite, Vuetify 3, and Pinia web application for construction estimation, custom line item creation, catalog management, and proposal generation.

---

## Key Session Architectural Choices & Component Architecture

### 1. Component Refactoring & Sub-Component Architecture
- **Monolithic Split**: Refactored `LineItems.vue` (~880 lines) into modular sub-components under `src/components/line-items/`:
  - `LineItemsList.vue`: Master catalog table, search, filters, delete modal.
  - `LineItemFormSettings.vue`: Top metadata settings form grid.
  - `LineItemRequirementsEditor.vue`: Recipe editor for Labor, Materials, and Equipment.
  - `LineItemPricingSummary.vue`: Sticky right-side price breakdown sidebar.
  - `LineItems.vue`: Clean parent orchestrator (~160 lines).

### 2. Line Item Grouping & Catalog Search Controls
- **Line Item Group Property**: Added `group` property to line item lineItems.
- **Top Dropdown Filters**: Added `Default Room` and `Group` dropdown filters alongside line items search bar in `LineItemsList.vue`.
- **Group Table Column**: Displayed color-coded `Group` chips in the master catalog table.

### 3. Room Selection Dropdown (`v-autocomplete`)
- **Tabbed Category Header (`#prepend-item`)**: Integrated sticky category tabs (`All`, `Bathroom`, `Bedroom`, `Closet`, `Kitchen`, `General`) at top of dropdown menu.
- **Predefined Searchable Selection**: Enforced strict selection from predefined list using `v-autocomplete` while prohibiting unlisted custom items.
- **Shortcode Output Display**: Rendered shortcode (e.g. `PR`, `PBA`) in selection slot without trailing space or cursor shift.

### 4. Premium Dialog Popup Redesign
- **Rounded-XL Cards & Avatar Icon Headers**: Updated all modal dialog popups across `LineItemsList.vue`, `CatalogManager.vue`, `QuoteBuilder.vue`, `QuoteList.vue`, and `SettingsManager.vue`:
  - `rounded-xl` card containers with soft shadow (`elevation="10"`).
  - Centered avatar icon chips (`v-avatar` with `mdi-delete-outline`, `mdi-plus-box-outline`, `mdi-pencil-outline`, `mdi-hammer-wrench`).
  - Styled pill action buttons (`variant="tonal"` for Cancel, flat colored buttons for primary actions).

### 5. Settings Manager Enhancements
- **Company Header & Prepared By Configuration**: Added editable settings panel in `SettingsManager.vue` for:
  - Company Address (multiline text area)
  - Company Phone & License #
  - Prepared By Name & Direct Phone Number
- **Line Item Groups Tab**: Added management tab to create and edit custom groups.

### 6. Multi-Step Quote Proposal Wizard
Implemented a 4-step wizard workflow in `QuoteBuilder.vue`:
- **Step 1: Header Info (`QuoteWizardStepHeader.vue`)**: Proposal metadata, customer details, project address, date, date of loss, and prepared by contact info.
- **Step 2: Items & Groups (`QuoteWizardStepSelector.vue`)**: Search bar, group & category filters, and 1-click **Select Entire Group** bulk cards.
- **Step 3: Room Summary (`QuoteWizardStepRooms.vue`)**: Auto-collects rooms based on items' `defaultRoom`, displays item counts per room, and allows moving items to any room.
- **Step 4: Interactive Proposal Worksheet (`QuoteProposalWorksheet.vue`)**:
  - **Collapsible Header Block**: Sycamore Design Build branding, customer info, prepared by.
  - **Per-Room Collapsible Table Sections**:
    - Room header with subtotal summary (`=> Kitchen Subtotal: Total $X.XX | Allowance $Y.YY`).
    - Table columns: `Description`, `Qty`, `U/M`, `Base Price`, `Unit Price`, `Total`, `Unit Allowance`, `Allowance`, `A` (Allowance toggle), `Strike` (Remove item).
  - **Allowance Formula Implementation**:
    - Default (Column `A` unchecked): `Allowance = Unit Allowance * Qty`
    - Full Allowance (Column `A` checked): `Allowance = Total Amount = (Qty * Unit Price) + Base Price`
  - **Tag & Category Summary Box**: Tag summary chips displaying item counts and total costs per group.
  - **Grand Totals Footer Box**: Overall proposal grand total & allowance subtotal.

### 7. Material & Equipment Tax, Markup & Allowance Model Overhaul
- **Removed Allowance % from Material/Equipment Models**: Removed database `allowance` % field from materials and equipment.
- **Tax % Defaults**:
  - Material Tax: **6% by default** (`0.06`).
  - Equipment Tax: **0% by default** (`0`).
- **Markup % Defaults**:
  - Material & Equipment Markup: **25% by default** (`0.25`).
- **Updated Pricing Formulas**:
  - **Allowance Price** = `Net Price + Tax` = `Net Price * (1 + Tax)`
  - **Gross Price (Client Price)** = `Net Price + Tax + Markup` = `Net Price * (1 + Tax) * (1 + Markup)`
- **Updated Components & Data Stores**:
  - `src/stores/app.js`: Updated `defaults`, `quoteTotals`, `roomTotals`, `addItemToRoom`, and `calculatelineItemsTotals`.
  - `src/components/CatalogManager.vue`: Updated form inputs (`Tax %`, `Markup %`), table headers, dialog pricing computeds, and save logic.
  - `src/components/line-items/LineItemRequirementsEditor.vue`: Updated recipe table headers, cells, and helper price functions.
  - `src/components/line-items/LineItemPricingSummary.vue` & `LineItems.vue`: Updated summary rollups for `Allowance Price` (`Price + Tax`) and `Gross Price` (`Price + Tax + Markup`).
  - `src/components/quote-builder/QuoteProposalWorksheet.vue`: Updated `getItemPricing` for proposal line items.
  - `data/catalog.json` & `data/seed.json`: Migrated all catalog entries to match the new pricing schema.

---

## Verification Status
- **Build Status**: Verified clean compilation via `npm run build` (0 syntax, type, or bundling errors).
