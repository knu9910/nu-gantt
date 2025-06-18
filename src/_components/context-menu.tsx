import React from "react";

interface ContextMenuProps {
  show: boolean;
  x: number;
  y: number;
  onCreateTask: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  show,
  x,
  y,
  onCreateTask,
}) => {
  if (!show) return null;

  return (
    <div
      className="fixed bg-white border border-gray-300 rounded-md shadow-lg z-20 py-1"
      style={{ left: x, top: y }}
    >
      <button
        onClick={onCreateTask}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        태스크 생성
      </button>
    </div>
  );
};
