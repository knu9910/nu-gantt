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

  // 태스크의 시작과 끝 인덱스 계산
  const taskStartIndex = task ? dates.indexOf(task.startDate) : -1;
  const taskEndIndex = task ? dates.indexOf(task.endDate) : -1;
  const isTaskStart = taskStartIndex === colIndex;
  const isTaskEnd = taskEndIndex === colIndex;

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
        <div className="absolute inset-0 flex items-center justify-center">
          {/* 태스크 이름을 시작 셀에서만 표시하되, 전체 태스크 영역에 걸쳐서 표시 */}
          {isTaskStart && (
            <div
              className="absolute left-0 top-0 h-full flex items-center cursor-pointer z-10"
              style={{
                width: `${(taskEndIndex - taskStartIndex + 1) * 60}px`,
              }}
              onClick={(e) => {
                if (onTaskClick && task) {
                  e.stopPropagation();
                  onTaskClick(task, e);
                }
              }}
            >
              <span className="text-white text-xs font-medium truncate px-2 w-full text-center">
                {task.name}
              </span>
            </div>
          )}

          {/* 리사이즈 핸들 표시 */}
          {isTaskStart && (
            <div className="absolute left-0 top-0 w-1 h-full bg-white bg-opacity-50 cursor-w-resize z-20" />
          )}
          {isTaskEnd && (
            <div className="absolute right-0 top-0 w-1 h-full bg-white bg-opacity-50 cursor-e-resize z-20" />
          )}
        </div>
      )}

      {taskPreview && (
        <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-400">
          {/* 미리보기 태스크 이름도 전체 영역에 표시 */}
          {dragState.currentPos?.col === colIndex && (
            <span className="text-white text-xs font-medium truncate px-1">
              {taskPreview.name}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
