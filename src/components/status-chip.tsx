import { Chip } from './chip';

import type { Status } from '@/data/types';
import { useStatusColors } from '@/hooks/use-status-colors';
import { useT } from '@/i18n';

const NEXT: Record<Status, Status> = { seen: 'drilling', drilling: 'works', works: 'seen' };

/** Status badge; tapping cycles seen → drilling → works. */
export function StatusChip({ status, onChange, small }: { status: Status; onChange?: (s: Status) => void; small?: boolean }) {
  const tr = useT();
  const statusColor = useStatusColors();

  return (
    <Chip
      label={tr.status[status]}
      color={statusColor[status]}
      selected
      small={small}
      onPress={onChange && (() => onChange(NEXT[status]))}
    />
  );
}
