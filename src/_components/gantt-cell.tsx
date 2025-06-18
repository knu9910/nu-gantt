import React from "react";
import { Task, DragState, DragSelection, ColumnSelection } from "./gantt-chart";
import {
  isCellInDragArea,
  isCellInDragSelection,
  getTaskPreview,
} from "../_utils/drag-utils";
import { isColumnSelected } from "../_utils/selection-utils";
import { getTaskForCell } from "../_utils/task-utils";

interface GanttCellProps {
  rowIndex: number;
  colIndex: number;
  dates: string[];
  tasks: Task[];
  dragState: DragState;
  dragSelection: DragSelection;
  columnSelection: ColumnSelection;
  onMouseDown: (
    rowIndex: number,
    colIndex: number,
    e: React.MouseEvent
  ) => void;
  onMouseEnter: (rowIndex: number, colIndex: number) => void;
  onContextMenu: (
    rowIndex: number,
    colIndex: number,
    e: React.MouseEvent
  ) => void;
  onTaskClick?: (task: Task, e: React.MouseEvent) => void;
}

export const GanttCell: React.FC<GanttCellProps> = ({
  rowIndex,
  colIndex,
  dates,
  tasks,
  dragState,
  dragSelection,
  columnSelection,
  onMouseDown,
  onMouseEnter,
  onContextMenu,
  onTaskClick,
}) => {
  const task = getTaskForCell(rowIndex, colIndex, tasks, dates);
  const taskPreview = getTaskPreview(
    rowIndex,
    colIndex,
    dragState,
    tasks,
    dates
  );
  const isInDragArea = isCellInDragArea(rowIndex, colIndex, dragState);
  const isInDragSelection = isCellInDragSelection(
    rowIndex,
    colIndex,
    dragSelection
  );
  const isDraggingThisTask =
    dragState.isDragging && dragState.taskId === task?.id;
  const isColumnSelectedCell = isColumnSelected(columnSelection, colIndex);

  return (
    <div
      key={`${rowIndex}-${colIndex}`}
      className={`
        min-w-[60px] h-10 border-r border-b border-gray-200 cursor-pointer relative
        ${
          isInDragArea
            ? "bg-blue-200"
            : isInDragSelection
            ? "bg-yellow-200 border-2 border-yellow-400"
            : isColumnSelectedCell
            ? "bg-blue-100"
            : "hover:bg-gray-100"
        }
        ${task && !isDraggingThisTask ? "bg-opacity-80" : ""}
        ${taskPreview ? "bg-opacity-50" : ""}
        ${isDraggingThisTask ? "opacity-50" : ""}
      `}
      style={{
        backgroundColor:
          task && !isDraggingThisTask
            ? task.color
            : taskPreview
            ? taskPreview.color
            : isColumnSelectedCell
            ? "#DBEAFE"
            : isInDragSelection
            ? "#FEF3C7"
            : undefined,
      }}
      onMouseDown={(e) => onMouseDown(rowIndex, colIndex, e)}
      onMouseEnter={() => onMouseEnter(rowIndex, colIndex)}
      onContextMenu={(e) => onContextMenu(rowIndex, colIndex, e)}
    >
      {task && !isDraggingThisTask && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          onClick={(e) => {
            // 태스크 클릭 시 이름 편집 모달 열기
            if (onTaskClick && task) {
              e.stopPropagation(); // 셀 클릭 이벤트 방지
              onTaskClick(task, e);
            }
          }}
        >
          <span className="text-white text-xs font-medium truncate px-1 cursor-pointer">
            {task.name}
          </span>
          {/* 리사이즈 핸들 표시 */}
          {dates.indexOf(task.startDate) === colIndex && (
            <div className="absolute left-0 top-0 w-1 h-full bg-white bg-opacity-50 cursor-w-resize" />
          )}
          {dates.indexOf(task.endDate) === colIndex && (
            <div className="absolute right-0 top-0 w-1 h-full bg-white bg-opacity-50 cursor-e-resize" />
          )}
        </div>
      )}

      {taskPreview && (
        <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-400">
          <span className="text-white text-xs font-medium truncate px-1">
            {taskPreview.name}
          </span>
        </div>
      )}
    </div>
  );
};
