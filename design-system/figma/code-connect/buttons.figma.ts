// Code Connect for the Buttons page (starter).
// Links each Figma button component to the Bootstrap 6 markup it stands for,
// so Dev Mode shows our real classes instead of generated CSS.
//
// Replace FILE_KEY and NODE_ID with the URL of each component in the Figma
// library (right-click the component > Copy link to selection).
// Check the property names against your components before publishing:
//   npx figma connect publish
import figma, { html } from '@figma/code-connect/html'

// Property names match figma/components.json: Version and Size are variant
// properties; Label is a text property on the component.
const size = figma.enum('Size', { Small: 'btn-sm', 'Extra small': 'btn-xs', Medium: '' })
const label = figma.string('Label')
const disabled = figma.enum('Version', { Disabled: true })

const button = (classes: string) => ({
  props: { size, label, disabled },
  example: ({ size, label, disabled }: { size: string; label: string; disabled: boolean }) =>
    html`<button type="button" class="${classes} ${size}" ?disabled=${disabled}>${label}</button>`
})

figma.connect('https://www.figma.com/design/FILE_KEY/Filmmakers?node-id=NODE_ID', button('btn-solid theme-primary'))      // Buttons/Primary
figma.connect('https://www.figma.com/design/FILE_KEY/Filmmakers?node-id=NODE_ID', button('btn-outline theme-secondary'))   // Buttons/Secondary
figma.connect('https://www.figma.com/design/FILE_KEY/Filmmakers?node-id=NODE_ID', button('btn-text theme-secondary'))      // Buttons/Tertiary
figma.connect('https://www.figma.com/design/FILE_KEY/Filmmakers?node-id=NODE_ID', button('btn-text theme-primary'))        // Buttons/Row action
figma.connect('https://www.figma.com/design/FILE_KEY/Filmmakers?node-id=NODE_ID', button('btn-text theme-danger'))         // Buttons/Danger (text)
figma.connect('https://www.figma.com/design/FILE_KEY/Filmmakers?node-id=NODE_ID', button('btn-solid theme-danger'))        // Buttons/Danger (solid)
