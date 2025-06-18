import React from "react";
import { GanttCellProps } from "../types/gantt-types";
import {
  isCellInDragArea,
  isCellInDragSelection,
  getTaskPreview,
} from "../_utils/drag-utils";
import {
  isColumnSelected,
  isColumnInMonthSelection,
} from "../_utils/selection-utils";
import { getTaskForCell } from "../_utils/task-utils";
import { isHoliday } from "../_utils/holiday-utils";
import {
  CELL_WIDTH,
  CELL_HEIGHT,
  RESIZE_HANDLE_WIDTH,
  TASK_NAME_PADDING,
  TASK_BORDER_OFFSET,
} from "../_constants/gantt-constants";

export const GanttCell: React.FC<GanttCellProps> = ({
  rowIndex,
  colIndex,
  dates,
  tasks,
  holidays,
  dragState,
  dragSelection,
  columnSelection,
  monthSelection,
  onMouseDown,
  onMouseEnter,
  onContextMenu,
  onTaskClick,
  onResizeStart,
  onResizeEnd,
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

  // 월 선택 확인
  const isMonthSelected = isColumnInMonthSelection(monthSelection, colIndex);

  // 현재 날짜가 공휴일인지 확인
  const currentDate = dates[colIndex];
  const isCurrentDateHoliday = currentDate
    ? isHoliday(currentDate, holidays)
    : false;

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
    e.preventDefault();
    if (task) {
      if (type === "start" && onResizeStart) {
        onResizeStart(rowIndex, colIndex, task.id);
      } else if (type === "end" && onResizeEnd) {
        onResizeEnd(rowIndex, colIndex, task.id);
      }
    }
  };

  return (
    <div
      key={`${rowIndex}-${colIndex}`}
      className={`
        ${
          task && !isDraggingThisTask ? "" : "border-r border-b border-gray-200"
        } relative cursor-pointer
        ${
          isInDragArea
            ? "bg-blue-200"
            : isInDragSelection
            ? "bg-yellow-200 border-2 border-yellow-400"
            : isColumnSelectedCell || isMonthSelected
            ? "bg-blue-100"
            : "hover:bg-gray-100"
        }
        ${task && !isDraggingThisTask ? "bg-opacity-80 cursor-move" : ""}
        ${taskPreview ? "bg-opacity-50" : ""}
      `}
      style={{
        width: `${CELL_WIDTH}px`,
        height: `${CELL_HEIGHT}px`,
        minWidth: `${CELL_WIDTH}px`,
        maxWidth: `${CELL_WIDTH}px`,
        backgroundColor:
          task && !isDraggingThisTask
            ? task.color
            : taskPreview
            ? taskPreview.color
            : isCurrentDateHoliday
            ? "#FEE2E2"
            : isColumnSelectedCell
            ? "#DBEAFE"
            : isInDragSelection
            ? "#FEF3C7"
            : undefined,
      }}
      onMouseDown={(e) => onMouseDown(rowIndex, colIndex, e)}
      onMouseEnter={() => {
        // 드래그 중이 아닐 때만 개별 셀 이벤트 처리
        if (!dragState.isDragging) {
          onMouseEnter(rowIndex, colIndex);
        }
      }}
      onContextMenu={(e) => onContextMenu(rowIndex, colIndex, e)}
    >
      {/* 드래그 중이 아닐 때만 원본 태스크 표시 */}
      {task && !isDraggingThisTask && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* 태스크 이름을 시작 셀에서만 표시하되, 전체 태스크 영역에 걸쳐서 표시 */}
          {isTaskStart && (
            <div
              className="absolute left-0 top-0 h-full flex items-center cursor-pointer z-10"
              style={{
                width: `${(taskEndIndex - taskStartIndex + 1) * CELL_WIDTH}px`,
              }}
              onMouseDown={(e) => {
                // 태스크 이름 영역 클릭 시 실제 클릭한 셀 위치 계산
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickedCellOffset = Math.floor(clickX / CELL_WIDTH);
                const actualClickedCol = taskStartIndex + clickedCellOffset;

                console.log("Task name area clicked:", {
                  clickX,
                  clickedCellOffset,
                  taskStartIndex,
                  actualClickedCol,
                  originalColIndex: colIndex,
                });

                // 실제 클릭한 셀 위치로 이벤트 발생
                onMouseDown(rowIndex, actualClickedCol, e);
              }}
              onClick={(e) => {
                if (onTaskClick && task) {
                  e.stopPropagation();
                  onTaskClick(task, e);
                }
              }}
            >
              <div
                className="task-name"
                style={{
                  position: "absolute",
                  left: "0",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "bold",
                  pointerEvents: "none",
                  zIndex: 10,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: `${Math.max(
                    (taskEndIndex - taskStartIndex + 1) * CELL_WIDTH -
                      TASK_BORDER_OFFSET,
                    0
                  )}px`,
                  textAlign: "center",
                  paddingLeft: `${TASK_NAME_PADDING}px`,
                  paddingRight: `${TASK_NAME_PADDING}px`,
                }}
              >
                {task.name}
              </div>
            </div>
          )}

          {/* 시작 셀의 왼쪽 끝에 리사이즈 핸들 */}
          {isTaskStart && taskStartIndex !== taskEndIndex && (
            <div
              className="absolute left-0 top-0 h-full cursor-w-resize z-30 hover:bg-white hover:bg-opacity-20"
              style={{ width: `${RESIZE_HANDLE_WIDTH}px` }}
              onMouseDown={(e) => handleResizeMouseDown(e, "start")}
              title="크기 조절"
            />
          )}

          {/* 끝 셀의 오른쪽 끝에 리사이즈 핸들 */}
          {isTaskEnd && taskStartIndex !== taskEndIndex && (
            <div
              className="absolute right-0 top-0 h-full cursor-e-resize z-30 hover:bg-white hover:bg-opacity-20"
              style={{ width: `${RESIZE_HANDLE_WIDTH}px` }}
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
              // 이동 프리뷰 - clickOffset 고려
              const taskDuration =
                dates.indexOf(originalTask.endDate) -
                dates.indexOf(originalTask.startDate);
              const clickOffset = dragState.clickOffset || 0;
              previewStartCol = (dragState.currentPos?.col || 0) - clickOffset;
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
                    width: `${
                      (previewEndCol - previewStartCol + 1) * CELL_WIDTH
                    }px`,
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
