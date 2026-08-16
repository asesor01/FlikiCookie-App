# Task Progress - FlikiCookie-Artisan Bakery

## Current Status
- Project: FlikiCookie Artisan Bakery full-stack application
- Phase: Hex cleanup & brand tokenization completion
- Goal: Finish aesthetic/visualization changes and start app for review

## Todo List

- [ ] Complete hex cleanup in src/** (estimated ~206 hex matches remaining)
  - [ ] Search and replace remaining hex colors with brand tokens
  - [ ] Priority: text colors, backgrounds, borders
  
- [ ] Finish tokenization of CakeVisualizer component
  - [ ] Replace hex in SVG stops/fills
  - [ ] Ensure all brand colors use var(--color-art-*) or utility classes

- [ ] Convert Emblema Flikicookie references to ES imports
  - [ ] Replace '/src/assets/images/Emblema%20Flikicookie.png' with import statements
  - [ ] Update all 3+ occurrences in src/components/ and src/App.tsx

- [ ] Finalize HTML cleanup in AdminDashboard
  - [ ] Clean inline styles in invoices/tables
  - [ ] Move to CSS classes where possible

- [ ] Dev server QA and visual testing
  - [ ] Run `npm run dev`
  - [ ] Test breakpoints (md+, mobile)
  - [ ] Verify z-index and logo overlap with topbar
  - [ ] Check cart button color consistency

- [ ] Accessibility review
  - [ ] Contrast of texts (verify 16px base font)
  - [ ] Focus states are proper
  - [ ] Verify all form elements accessible

- [ ] Update cambios.yaml
  - [ ] Document all files modified
  - [ ] Update hex match counts
  - [ ] Add summary of changes

- [ ] Start app for review
  - [ ] Ensure `npm run dev` launches without errors
  - [ ] Verify all features work
  - [ ] Prepare for user review