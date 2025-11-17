# Coffee Shop Pro Color Scheme Guidelines

## Palette Overview

- Brand: `#8B5E34` (light: `#D4A373`, dark: `#5C3D24`)
- Secondary: `#D4A373` (hover: `#C68B5B`)
- Accent: `#A68A64`
- Success: `#16A34A`
- Warning: `#CA8A04`
- Error: `#DC2626`
- Background (light): `#FAFAF7`
- Surface (light): `#FFFFFF`
- Foreground (light text): `#1F2937`
- Muted (light): `#64748B`
- Border (light): `#E5E7EB`
- Background (dark): `#0B0F19`
- Surface (dark): `#111827`
- Foreground (dark text): `#F1F5F9`
- Muted (dark): `#94A3B8`
- Border (dark): `#334155`

## Centralized Tokens

- Colors are defined as CSS variables in `:root` and overridden in `.dark`.
- Tailwind maps tokens to utility classes: `bg-brand`, `text-brand`, `bg-background`, `text-foreground`, `border-border`, `bg-surface`, etc.
- Use `dark:` variants for dark mode where needed.

## Approved Combinations

- Buttons: `bg-brand` + `text-white` + `hover:bg-brand-hover`.
- Gradients: `bg-gradient-to-r from-brand to-brand-dark` for primary accents.
- Forms: `bg-surface` + `text-foreground` + `border-border` + `focus:ring-brand`.
- Navigation active: `from-brand to-brand-dark` with `text-white`.
- Alerts: `notification-success|warning|error|info` utility classes.
- Cards: `bg-surface` + `border-border`.

## Usage Rules

- Prefer `text-foreground` on `bg-background` or `bg-surface`.
- Use `text-muted` for secondary text and helper copy.
- Limit brand color usage to interactive elements, highlights, and key accents.
- Avoid mixing legacy Tailwind named colors (e.g., `amber-500`) in components; use mapped tokens.

## Accessibility

- Maintain at least 4.5:1 contrast for body text.
- Brand backgrounds use `text-white` to exceed contrast thresholds.
- Focus states must use `focus:ring-brand` with visible ring and offset.
- Dark mode keeps equivalent contrast through `.dark` token overrides.

## Brand Alignment

- Colors evoke a modern coffee aesthetic: warm browns, latte tones, and neutral surfaces.
- Gradients and icon accents use the brand pair (`brand` → `brand-dark`).

## Implementation Notes

- Tokens live in `src/index.css`; Tailwind mapping in `tailwind.config.js`.
- Toggle dark mode via the header button; persisted in `localStorage`.