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

  // 리사이즈 핸들 마우스 다운 핸들러
  const handleResizeMouseDown = (
    e: React.MouseEvent,
    type: "start" | "end"
  ) => {
    e.stopPropagation();
    if (task) {
      // 리사이즈 타입에 따라 드래그 상태 설정
      const dragType = type === "start" ? "resize-start" : "resize-end";
      onMouseDown(rowIndex, colIndex, {
        ...e,
        button: 0,
        // 커스텀 속성으로 리사이즈 타입 전달
        nativeEvent: { ...e.nativeEvent, resizeType: dragType },
      } as React.MouseEvent);
    }
  };

  return (
    <div
      key={`${rowIndex}-${colIndex}`}
      className={`
        min-w-[60px] h-10 border-r border-b border-gray-200 relative cursor-pointer
        ${
          isInDragArea
            ? "bg-blue-200"
            : isInDragSelection
            ? "bg-yellow-200 border-2 border-yellow-400"
            : isColumnSelectedCell
            ? "bg-blue-100"
            : "hover:bg-gray-100"
        }
        ${task && !isDraggingThisTask ? "bg-opacity-80 cursor-move" : ""}
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

          {/* 시작 셀의 왼쪽 끝에 리사이즈 핸들 */}
          {isTaskStart && taskStartIndex !== taskEndIndex && (
            <div
              className="absolute left-0 top-0 w-2 h-full cursor-w-resize z-30 hover:bg-white hover:bg-opacity-20"
              onMouseDown={(e) => handleResizeMouseDown(e, "start")}
              title="크기 조절"
            />
          )}

          {/* 끝 셀의 오른쪽 끝에 리사이즈 핸들 */}
          {isTaskEnd && taskStartIndex !== taskEndIndex && (
            <div
              className="absolute right-0 top-0 w-2 h-full cursor-e-resize z-30 hover:bg-white hover:bg-opacity-20"
              onMouseDown={(e) => handleResizeMouseDown(e, "end")}
              title="크기 조절"
            />
          )}
        </div>
      )}

      {taskPreview && (
        <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-400">
          {/* 미리보기 태스크 이름을 전체 영역에 걸쳐서 표시 */}
          {(() => {
            const originalTask = tasks.find((t) => t.id === dragState.taskId);
            if (!originalTask) return null;

            let previewStartCol = 0;
            let previewEndCol = 0;

            if (dragState.dragType === "move") {
              // 이동 프리뷰
              const taskDuration =
                dates.indexOf(originalTask.endDate) -
                dates.indexOf(originalTask.startDate);
              previewStartCol = dragState.currentPos?.col || 0;
              previewEndCol = previewStartCol + taskDuration;
            } else if (dragState.dragType === "resize-start") {
              // 시작점 리사이즈 프리뷰
              const originalEndCol = dates.indexOf(originalTask.endDate);
              previewStartCol = Math.min(
                dragState.currentPos?.col || 0,
                originalEndCol
              );
              previewEndCol = originalEndCol;
            } else if (dragState.dragType === "resize-end") {
              // 끝점 리사이즈 프리뷰
              const originalStartCol = dates.indexOf(originalTask.startDate);
              previewStartCol = originalStartCol;
              previewEndCol = Math.max(
                dragState.currentPos?.col || 0,
                originalStartCol
              );
            }

            // 시작 셀에서만 전체 영역에 걸친 이름 표시
            if (previewStartCol === colIndex) {
              return (
                <div
                  className="absolute left-0 top-0 h-full flex items-center z-10"
                  style={{
                    width: `${(previewEndCol - previewStartCol + 1) * 60}px`,
                  }}
                >
                  <span className="text-white text-xs font-medium truncate px-2 w-full text-center">
                    {taskPreview.name}
                  </span>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
};
