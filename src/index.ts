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
export {
  Inspector,
  InspectorSection,
  InspectorRow,
  type InspectorProps,
  type InspectorTab,
  type InspectorSectionProps,
  type InspectorRowProps,
} from './feedback/Inspector';
export {
  Popover,
  FilterSection,
  FilterRow,
  type PopoverProps,
  type FilterSectionProps,
  type FilterRowProps,
} from './feedback/Popover';
export { ColorLegend, type ColorLegendProps, type ColorLegendItem } from './feedback/ColorLegend';
export {
  HoverCard, HoverCardHeader, HoverCardRow, HoverCardNote,
  type HoverCardProps,
} from './feedback/HoverCard';
export { QtyEditPopover, type QtyEditPopoverProps } from './feedback/QtyEditPopover';

// Status (Single Source of Truth fuer cueplex Status-Vokabular)
export {
  STATUS_KEYS,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_BG,
  DIMMED_STATUSES,
  isDimmedStatus,
  StatusPill,
  statusToPillIntent,
  type StatusKey,
  type StatusPillProps,
} from './status/Status';

// Forms
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './forms/Button';
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
export { Section, type SectionProps } from './forms/Section';
export { FormGrid, FormFieldSpan, type FormGridProps, type FormFieldSpanProps } from './forms/FormGrid';
export { SubGroupLabel, type SubGroupLabelProps } from './forms/SubGroupLabel';
export { MultiSelect, type MultiSelectProps, type MultiSelectOption } from './forms/MultiSelect';
export { Select as DropdownSelect, type SelectProps as DropdownSelectProps, type SelectOption as DropdownSelectOption } from './forms/Select';

// Data
export {
  DataTable,
  StatusDot,
  Pill,
  RowAction,
  RowLink,
  InfoBanner,
  type DataTableProps,
  type StatusDotProps,
  type StatusDotIntent,
  type PillProps,
  type RowActionProps,
  type RowLinkProps,
  type InfoBannerProps,
  type InfoBannerIntent,
} from './data/DataPrimitives';

// Theme-Store (Hook for consumers)
export { useTheme } from './theme/useTheme';
