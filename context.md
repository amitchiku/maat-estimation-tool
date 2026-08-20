# Project Context & Session Progress

## Overview
Estimation tool for construction and renovation projects built with Vue 3, Vuetify 3, Pinia, and Express Node.js backend API.

## Recent Architectural & Feature Decisions

### 1. Line Items Table & Pagination Format
- **Paginated Table**: Line Items catalog now displays in a paginated table format (10 items per page) with a page footer indicator and `<v-pagination>` navigation.
- **Interactive Column Sorting**: Added interactive sorting (ascending/descending) with arrow indicators on `Category`, `Name`, `Total Price`, `Activity`, `Trade`, and `Description`. Sorting automatically resets pagination back to Page 1.
- **Fixed Column Widths & Layout**: Enforced `table-layout: fixed !important` and explicit fixed column widths:
  - `Category`: 140px
  - `Name`: 320px
  - `Total Price`: 130px
  - `Activity`: 130px
  - `Trade`: 130px
  - `Description`: 280px
  - `Actions`: 100px
- **Fixed Row Height**: Enforced uniform 60px height (`height: 60px !important;`) on table rows (`tr`) and cells (`td`).
- **Typography & Truncation**:
  - `Name` and `Total Price` font weights set to standard `regular` (`font-weight-regular`).
  - `Description` truncated to 55 characters with `...` and hover tooltip (`<v-tooltip>`) displaying full description.
- **Table Column Cleanups**: Removed redundant `Group`, `Default Room`, and `Allowance` columns from the Line Items list table.

### 2. Settings Defaults Panel
- Renamed settings fields to:
  1. `Default Material Tax`
  2. `Default Material Mark Up`
  3. `Default Equipment Tax`
  4. `Default Equipment Mark Up`
- Added subscript note: `* Note: Changing these default settings does not change existing line items.`

### 3. Selection Input Improvements & Layout Stability
- Disabled browser autofill popovers by adding `:input-props="{ autocomplete: 'new-password', role: 'presentation', name: '...' }"` to selection inputs across components.
- Added `min-height: 380px` constraint to `LineItemRequirementsEditor.vue` card container to maintain layout stability during tab switches.

## Core Component Map
- `src/components/LineItems.vue`: Parent line item catalog view.
- `src/components/line-items/LineItemsList.vue`: Paginated line items table view with column sorting and fixed styling.
- `src/components/line-items/LineItemFormSettings.vue`: Settings form for editing line item properties.
- `src/components/line-items/LineItemRequirementsEditor.vue`: Labor, material, equipment requirements editor.
- `src/components/SettingsManager.vue`: Defaults and settings configuration manager.
- `src/stores/app.js`: Pinia state management for catalog data and settings.
