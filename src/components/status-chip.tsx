import { Chip } from './chip';

import { STATUS_COLOR } from '@/data/labels';
import type { Status } from '@/data/types';
import { useT } from '@/i18n';

const NEXT: Record<Status, Status> = { seen: 'drilling', drilling: 'works', works: 'seen' };

/** Status badge; tapping cycles seen → drilling → works. */
export function StatusChip({ status, onChange, small }: { status: Status; onChange?: (s: Status) => void; small?: boolean }) {
  const tr = useT();

  return (
    <Chip
      label={tr.status[status]}
      color={STATUS_COLOR[status]}
      selected
      small={small}
      onPress={onChange && (() => onChange(NEXT[status]))}
    />
  );
}
