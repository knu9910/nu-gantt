import { ContextMenuProps } from '@/types/gantt/gantt-types';
import React from 'react';

export const ContextMenu = ({ show, x, y, task, onCreateTask, onDeleteTask }: ContextMenuProps) => {
  if (!show) return null;

  return (
    <div className="fixed bg-white border border-gray-300 rounded-md shadow-lg z-20 py-1" style={{ left: x, top: y }}>
      {task ? (
        <button
          onClick={() => {
            if (onDeleteTask) {
              onDeleteTask(task.id);
            }
          }}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-600"
        >
          태스크 삭제
        </button>
      ) : (
        <button onClick={onCreateTask} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
          태스크 생성
        </button>
      )}
    </div>
  );
};
