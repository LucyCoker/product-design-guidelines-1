# Component mapping: rebuilt from the Library

`Component mapping.dc.html` (in this folder) replaces the Component mapping page in Claude Design. The sections, the codes, the Bootstrap 3.4 column, the primary colour setting and the dense setting are unchanged. The Bootstrap 6 column and every example now come from the Filmmakers System Library, which is the source of truth.

## How to update the page in Claude Design

1. Open **Component mapping.dc.html** in the Claude Design project.
2. Replace the file's whole contents with the new file.
3. Check the page loads, then try a menu (for example More in Row action) to confirm Bootstrap's scripts run.

## What changed

**Every row**
- The Bootstrap 6 column shows the Library's name, classes, status and note, plus an **In the Library** link and the number of open questions.
- The example is the Library's default example.
- The RowActions and FilterBar imports are gone. Those rows use Library markup, so the page no longer depends on those prototype components.
- The page loads the Library's theme layer (`filmmakers.css`) in a `<style>` block. Its focus ring (full-strength blue-500, about 3.6:1) replaces the old 50% mix, which failed the 3:1 a focus indicator needs.

**New rows**
- FRM-11 Validation, after FRM-10.
- CNT-14 Project card, in Content.
- SF-4 Simple search and filter bar, after SF-3.

**Changed meaning**
- CNT-2 is now the **Production list**, the one shell for Auditions and Selections lists.
- CNT-10 **Profile tile** is a card with the name and role under the photo, and a placeholder when there's no photo. It has an open question about the "A" badge and the sort arrows.
- MNU-2: this Bootstrap build has no `.menu-end`. Menus at the end of a row use `data-bs-placement="bottom-end"`.
- MSG-5 maps to the Library's Client zone button. The accent is `orange-600` (about 4.4:1 on white), not #EF7428.
- BTN-1 to BTN-7 and BTN-10 map to the Library's Buttons entries (Secondary, Primary, Row action, Danger, Tertiary, Button group, Sizes). MNU-1 to MNU-5 map to its Menus entries and the Header menus.
- FRM-9's note used to point to "FRM-11" for checkboxes inside menu items. FRM-11 is now Validation, so the note points to the Combobox (SF-3).

**Removed or retired**
- CNT-3 List group, CNT-8 Definition list and CNT-9 Image placeholder are marked **Removed from the Library**, with the reason.
- FRM-6 form-group is marked **Retired**.

**Kept as they were** (no Library entry yet)
- NAV-2 navbar-brand
- BTN-8 caret
- FRM-2 Filter bar dropdowns

## Check in Claude Design

- **Bootstrap version:** the page still loads `vendor/bootstrap.css` from the project. The Library is built on Bootstrap 6 alpha `bc4bcb4`. If the project's copy is older, some classes (`btn-subtle`, `menu-item-check`, `form-field`) may not render as they do in the Library.
- **Static examples:** the examples are markup, so filtering in the search and filter bars and the validation demo don't run here. Menus and tooltips still work through Bootstrap. Use the Library to try the behaviour.
- **SF-1:** the row shows the compact bar. Open Search and filter, or the Library, for the full version.
- **Keeping it in sync:** this is a snapshot of the Library on 1 October 2026. Ask for it to be regenerated after Library changes.
