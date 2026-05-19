'use client';

import TableCard from './TableCard';

interface Table {
  id: string;
  name: string;
  status: 'free' | 'occupied' | 'warning' | 'alert';
  timerStartedAt: string | null;
  timerDurationMinutes: number;
  warningThresholdMinutes: number;
  remainingSeconds: number | null;
  note: string | null;
  position: number;
}

interface TableGridViewProps {
  tables: Table[];
  workspaceId: string;
  defaultTimerDurationMinutes: number;
  subscriptionActive: boolean;
  onUpdate: () => void;
  onDelete?: () => void;
}

export default function TableGridView({ tables, workspaceId, defaultTimerDurationMinutes, subscriptionActive, onUpdate, onDelete }: TableGridViewProps) {
  return (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          allTables={tables}
          workspaceId={workspaceId}
          defaultTimerDurationMinutes={defaultTimerDurationMinutes}
          subscriptionActive={subscriptionActive}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
