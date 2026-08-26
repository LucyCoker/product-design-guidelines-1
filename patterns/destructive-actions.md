# Destructive actions

`Status: Draft` · `Owner: [name]`

## What it is

Any action that deletes, removes, archives, cancels, revokes, or overwrites something a user has created or relies on. Also covers actions that are technically reversible but expensive to reverse (bulk changes, sending, publishing).

## When to use / when not to

The decision is **reversible or not**, not **important or not**.


| Situation                        | Pattern                                                  |
| -------------------------------- | -------------------------------------------------------- |
| Reversible, low value            | Act immediately. Offer undo.                             |
| Reversible, high value or bulk   | Act immediately. Offer undo, persistent until dismissed. |
| Irreversible                     | Confirmation dialog naming the object.                   |
| Irreversible + high value + rare | Confirmation dialog plus typed confirmation.             |


Why offer undo? Because confirmation is not the default. It should not be the sole error-prevention method — undo gives users a safety net that makes mistakes low-cost.

## Bootstrap default

Use the standard modal component and the danger theme for the confirming action. Do not build a custom dialog.

Undo uses the standard toast component.

## Our rules

**Choosing the pattern**

- Reversible actions MUST NOT use the word delete or show a confirmation dialog. Use remove or archive, and allow undo via toast or an archive area.
- Irreversible actions MUST show a confirmation dialog.
- Typed confirmation (`type DELETE to confirm`) MUST be reserved for irreversible actions affecting other users or billed data. Used too often, non-standard responses become another automated behaviour and lose their power. **ASK** — do we use this, and where?

**Writing the dialog**

- The dialog MUST name the specific object and the consequence. Without identifying details, the only sensible reaction to "Are you sure?" is to hit Yes without thinking.
- The title MUST be a question naming the action and object: `Delete invoice INV-4021?`
- The body MUST state what is lost and whether it can be recovered.
- The confirming button MUST repeat the verb: `Delete invoice`. It MUST NOT say `OK`, `Yes`, or `Confirm`.
- The cancelling button MUST be `Cancel`.

**Layout**

- The destructive and cancelling actions MUST NOT be adjacent or visually similar. Placing destructive and benign actions in close proximity is one of the top ten application design mistakes, and it is acceptable to make the consequential option slightly harder to reach.
- `Cancel` MUST be the default focused control.
- Destructive row actions in tables MUST sit behind an overflow menu, never as a bare icon adjacent to a benign one.
- Destructive row actions MUST be labelled with text in the menu, never presented as a bare icon.

**Undo**

- Undo MUST remain available for at least 10 seconds.
- Undo for bulk actions MUST persist until dismissed.
- The undo message MUST state what happened and the count: `4 records archived. Undo`.

**Accessibility**

- Focus MUST move into the dialog on open, be trapped while open, and return to the triggering element on close.
- `Esc` MUST cancel. It MUST NOT confirm.
- The dialog MUST NOT rely on colour alone to signal danger.

## Do this / not this

**Dialogs**
✅ `Delete invoice INV-4021?` → *This permanently deletes the invoice and its payment history. This cannot be undone.* → `[Cancel] [Delete invoice]`
❌ `Are you sure?` → *This action cannot be undone.* → `[Cancel] [OK]`

**Archiving**
✅ Archiving a project → acts immediately → toast: `Project archived. Undo`
❌ Archiving a project → modal: `Are you sure you want to archive?`

**Destructive actions in tables**
✅ Row actions: `Edit` inline · overflow menu containing Duplicate, Download, Send, then a divider, then `Delete invoice` in danger colour
❌ Row actions: edit, duplicate and delete as three adjacent icon buttons

## Unresolved

### Open decisions

**Typed confirmation** — whether we use it at all, and if so which actions qualify.
*Review by: [date]*

**Toast position** — where should Toast be positioned? Should it depend on the action. Should this detail be here or in Toast component documentation.
*Review by: [date]*

### Watching

*None yet.*

## Sources

- [Confirmation Dialogs Can Prevent User Errors](https://www.nngroup.com/articles/confirmation-dialog/) — NN/g
- [Dangerous UX: Consequential Options Close to Benign Options](https://www.nngroup.com/articles/proximity-consequential-options/) — NN/g
- [Preventing User Errors: Avoiding Conscious Mistakes](https://www.nngroup.com/articles/user-mistakes/) — NN/g
- [Bulk Actions: 3 Design Guidelines](https://www.nngroup.com/videos/bulk-actions-design-guidelines/) — NN/g
