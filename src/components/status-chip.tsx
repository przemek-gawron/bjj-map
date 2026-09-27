import { Chip } from './chip';

import { STATUS_COLOR, STATUS_LABEL } from '@/data/labels';
import type { Status } from '@/data/types';

const NEXT: Record<Status, Status> = { seen: 'drilling', drilling: 'works', works: 'seen' };

/** Status badge; tapping cycles seen → drilling → works. */
export function StatusChip({ status, onChange, small }: { status: Status; onChange?: (s: Status) => void; small?: boolean }) {
  return (
    <Chip
      label={STATUS_LABEL[status]}
      color={STATUS_COLOR[status]}
      selected
      small={small}
      onPress={onChange && (() => onChange(NEXT[status]))}
    />
  );
}
