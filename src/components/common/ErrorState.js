import EmptyState from './EmptyState';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'Please check your connection and try again.',
  actionLabel = 'Retry',
  onAction,
  compact = false,
  style,
}) => (
  <EmptyState
    icon="alert-circle-outline"
    title={title}
    message={message}
    actionLabel={onAction ? actionLabel : undefined}
    onAction={onAction}
    compact={compact}
    style={style}
  />
);

export default ErrorState;
