# @cueplex/ui

Shared UI-Package für cueplex-Tools (ops, crew, invoices, power, led).

## v0.1.0 Scope

- **Layout**: `<AppShell>`, `<Sidebar>`, `<Header>`, `<ThemeToggle>`
- **Auth**: `<AuthProvider>`, `useAuth()`, `<UserMenu>`
- **Branding**: `<CxLogoTextIcon>`, `<CxLogoIcon>`
- **Visuals**: `<Gantt>` (1:1 aus crew/EventTimeline)
- **Theme**: `theme.css` (CSS-Vars, Light+Dark, Sage-Green Accent)

## Usage

```tsx
// main.tsx
import '@cueplex/ui/theme.css';
import { AppShell, AuthProvider } from '@cueplex/ui';

<AuthProvider config={{ keycloakUrl, realm, clientId }}>
  <AppShell>
    <YourApp />
  </AppShell>
</AuthProvider>
```

## Install (GitHub Packages)

`.npmrc`:
```
@cueplex:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then: `npm install @cueplex/ui`
