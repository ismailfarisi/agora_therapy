/**
 * Type definitions for schedule configuration components
 */

export interface ScheduleStatus {
  status: "not_configured" | "inactive" | "active";
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
  badgeText: string;
}

export interface ScheduleConfigurationProps {
  onSetupClick: () => void;
  onManageClick: () => void;
}

export interface ScheduleOverrideProps {
  onManageOverrides: () => void;
  onAddOverride: () => void;
}

export interface ScheduleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "schedule" | "overrides";
  therapistId: string;
}

export interface SchedulePreviewData {
  date: Date;
  slots: number;
  status: "available" | "limited" | "unavailable";
}
