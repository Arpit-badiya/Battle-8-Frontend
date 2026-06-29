import Badge from './Badge';

const statusConfig = {
  upcoming: { label: 'Upcoming', tone: 'blue', icon: 'time-outline' },
  live: { label: 'Live', tone: 'danger', icon: 'radio-button-on' },
  completed: { label: 'Completed', tone: 'success', icon: 'checkmark-circle' },
  cancelled: { label: 'Cancelled', tone: 'default', icon: 'close-circle' },
  full: { label: 'Full', tone: 'warning', icon: 'lock-closed' },
  hot: { label: 'Hot', tone: 'gold', icon: 'flame' },
  guaranteed: { label: 'Guaranteed', tone: 'gold', icon: 'shield-checkmark' },
  pending: { label: 'Pending', tone: 'warning', icon: 'time-outline' },
};

const StatusChip = ({ status = 'upcoming', label, compact = true, style }) => {
  const config = statusConfig[String(status).toLowerCase()] || statusConfig.upcoming;

  return (
    <Badge
      label={label || config.label}
      tone={config.tone}
      icon={config.icon}
      compact={compact}
      style={style}
    />
  );
};

export default StatusChip;
