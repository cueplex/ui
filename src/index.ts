// @cueplex/ui v0.1.0 — Shared UI Package

// Layout
export { AppShell } from './layout/AppShell';
export {
  SidebarShell,
  SidebarLogo,
  SidebarNav,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
  SidebarSettingsButton,
  SidebarCollapseButton,
  type SidebarShellProps,
  type SidebarLogoProps,
  type SidebarNavProps,
  type SidebarSectionProps,
  type SidebarItemProps,
  type SidebarFooterProps,
  type SidebarSettingsButtonProps,
} from './layout/SidebarPrimitives';
export { Header } from './layout/Header';
export { ThemeToggle } from './layout/ThemeToggle';

// Branding
export { CxLogoTextIcon, CxLogoIcon } from './layout/CxLogo';

// Auth
export { AuthProvider } from './auth/AuthProvider';
export { useAuth, type AuthContextValue } from './auth/useAuth';
export { UserMenu } from './auth/UserMenu';

// Visuals
export { Gantt, type GanttItem, type GanttProps, type GanttHandle } from './visuals/Gantt';

// Feedback
export { Tooltip, useTooltip, type TooltipProps, type UseTooltipOptions } from './feedback/Tooltip';

// Forms
export { SearchBar, type SearchBarProps, type SearchResult } from './forms/SearchBar';
export {
  FormField,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormSection,
  StatusBadge,
  type FormFieldProps,
  type FormInputProps,
  type FormTextareaProps,
  type FormSelectProps,
  type FormCheckboxProps,
  type SelectOption,
  type StatusBadgeProps,
} from './forms/FormControls';

// Theme-Store (Hook for consumers)
export { useTheme } from './theme/useTheme';
