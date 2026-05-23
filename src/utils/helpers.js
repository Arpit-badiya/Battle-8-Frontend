export const formatCoins = (
  value = 0
) => {
  const amount = Number(
    value || 0
  );

  if (
    Number.isNaN(amount)
  ) {
    return '0';
  }

  return amount.toLocaleString(
    'en-IN'
  );
};

export const getJoinProgress = (
  joined,
  total
) => {
  const safeJoined =
    Number(joined || 0);

  const safeTotal =
    Number(total || 0);

  if (
    !safeTotal ||
    safeTotal <= 0
  ) {
    return 0;
  }

  return Math.min(
    safeJoined / safeTotal,
    1
  );
};

export const getInitials = (
  name = ''
) =>
  String(name)
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(
      (part) =>
        part[0]
    )
    .join('')
    .slice(0, 2)
    .toUpperCase();