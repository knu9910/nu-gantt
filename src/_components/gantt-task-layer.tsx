"use client";

import React, { useMemo } from "react";
import { Task, DragState, DragSelection } from "@/types/gantt-types";
import { CELL_WIDTH, CELL_HEIGHT } from "@/_constants/gantt-constants";
import { getTaskForCell } from "@/_utils/task-utils";
import { isCellInDragArea, isCellInDragSelection } from "@/_utils/drag-utils";

interface GanttTaskLayerProps {
  dates: string[];
  rows: string[];
  tasks: Task[];
  dragState: DragState;
  dragSelection: DragSelection;
  onMouseDown: (row: number, col: number, e: React.MouseEvent) => void;
  onMouseEnter: (row: number, col: number) => void;
  onTaskClick: (task: Task, e: React.MouseEvent) => void;
  onResizeStart: (rowIndex: number, colIndex: number, taskId: string) => void;
  onResizeEnd: (rowIndex: number, colIndex: number, taskId: string) => void;
  onContextMenu?: (row: number, col: number, e: React.MouseEvent) => void;
}

// 개별 태스크 컴포넌트 - 메모이제이션으로 최적화
const TaskItem = React.memo<{
  task: Task;
  x: number;
  y: number;
  width: number;
  startCol: number;
  endCol: number;
  dragState: DragState;
  onMouseDown: (row: number, col: number, e: React.MouseEvent) => void;
  onMouseEnter: (row: number, col: number) => void;
  onTaskClick: (task: Task, e: React.MouseEvent) => void;
  onResizeStart: (rowIndex: number, colIndex: number, taskId: string) => void;
  onResizeEnd: (rowIndex: number, colIndex: number, taskId: string) => void;
  onContextMenu?: (row: number, col: number, e: React.MouseEvent) => void;
}>(
  ({
    task,
    x,
    y,
    width,
    startCol,
    endCol,
    dragState,
    onMouseDown,
    onMouseEnter,
    onTaskClick,
    onResizeStart,
    onResizeEnd,
    onContextMenu,
  }) => {
    // 현재 태스크가 드래그 중인지 확인
    const isBeingDragged =
      dragState.isDragging &&
      dragState.taskId === task.id &&
      (dragState.dragType === "move" ||
        dragState.dragType === "resize-start" ||
        dragState.dragType === "resize-end");

    return (
      <div
        className={`absolute pointer-events-auto cursor-pointer group transition-all duration-200 ease-in-out ${
          isBeingDragged
            ? "opacity-0 scale-95 pointer-events-none"
            : "opacity-100 scale-100"
        }`}
        style={{
          left: x,
          top: y,
          width: width,
          height: CELL_HEIGHT,
          backgroundColor: task.color,
          border: "1px solid rgba(0,0,0,0.2)",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          paddingLeft: "8px",
          paddingRight: "8px",
          fontSize: "12px",
          fontWeight: "500",
          color: "#fff",
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          zIndex: 10,
        }}
        onMouseDown={(e) => {
          // TaskItem 내에서 실제 클릭한 셀 위치 계산
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;

          // 클릭한 위치를 셀 단위로 변환
          const clickedCellOffset = Math.floor(clickX / CELL_WIDTH);

          // 실제 클릭한 셀의 인덱스 계산
          const actualClickedCol = startCol + clickedCellOffset;

          // 태스크 범위를 벗어나지 않도록 제한
          const validClickedCol = Math.max(
            startCol,
            Math.min(endCol, actualClickedCol)
          );

          console.log("Task mouse down:", {
            taskId: task.id,
            taskName: task.name,
            startCol,
            endCol,
            clickX,
            clickedCellOffset,
            actualClickedCol,
            validClickedCol,
            CELL_WIDTH,
          });

          onMouseDown(task.row, validClickedCol, e);
        }}
        onMouseEnter={(e) => {
          // 드래그 중일 때만 정확한 셀 위치 계산
          if (dragState.isDragging) {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;

            // 마우스 위치를 셀 단위로 변환
            const hoveredCellOffset = Math.floor(mouseX / CELL_WIDTH);

            // 실제 마우스가 위치한 셀의 인덱스 계산
            const actualHoveredCol = startCol + hoveredCellOffset;

            // 태스크 범위를 벗어나지 않도록 제한
            const validHoveredCol = Math.max(
              startCol,
              Math.min(endCol, actualHoveredCol)
            );

            onMouseEnter(task.row, validHoveredCol);
          } else {
            // 드래그 중이 아닐 때는 시작 셀로 처리
            onMouseEnter(task.row, startCol);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          onTaskClick(task, e);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          console.log("Task right click:", {
            taskId: task.id,
            row: task.row,
            col: startCol,
          });
          if (onContextMenu) {
            onContextMenu(task.row, startCol, e);
          }
        }}
      >
        {/* 태스크 이름 */}
        <span className="truncate flex-1">{task.name}</span>

        {/* 리사이즈 핸들 - 시작 */}
        <div
          className="absolute left-0 top-0 w-1 h-full cursor-w-resize opacity-0 group-hover:opacity-100 bg-white/50"
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(task.row, startCol, task.id);
          }}
        />

        {/* 리사이즈 핸들 - 끝 */}
        <div
          className="absolute right-0 top-0 w-1 h-full cursor-e-resize opacity-0 group-hover:opacity-100 bg-white/50"
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeEnd(task.row, endCol, task.id);
          }}
        />
      </div>
    );
  }
);

TaskItem.displayName = "TaskItem";

export const GanttTaskLayer: React.FC<GanttTaskLayerProps> = React.memo(
  ({
    dates,
    rows,
    tasks,
    dragState,
    dragSelection,
    onMouseDown,
    onMouseEnter,
    onTaskClick,
    onResizeStart,
    onResizeEnd,
    onContextMenu,
  }) => {
    const containerWidth = dates.length * CELL_WIDTH;
    const containerHeight = rows.length * CELL_HEIGHT;

    // 드래그 미리보기 계산 - 태스크 단위로 최적화
    const dragPreviewTask = useMemo(() => {
      if (
        !dragState.isDragging ||
        !dragState.currentPos ||
        !dragState.taskId ||
        dragState.dragType === "new"
      ) {
        return null;
      }

      const originalTask = tasks.find((t) => t.id === dragState.taskId);
      if (!originalTask) return null;

      const originalStartCol = dates.indexOf(originalTask.startDate);
      const originalEndCol = dates.indexOf(originalTask.endDate);
      const taskDuration = originalEndCol - originalStartCol;
      const clickOffset = dragState.clickOffset || 0;

      let previewStartCol: number;
      let previewEndCol: number;
      let previewRow: number;

      if (dragState.dragType === "move") {
        // 이동: clickOffset을 고려한 위치 계산
        previewStartCol = dragState.currentPos.col - clickOffset;
        previewEndCol = previewStartCol + taskDuration;
        previewRow = dragState.currentPos.row; // 이동 시에는 행 변경 가능
      } else if (dragState.dragType === "resize-start") {
        // 시작점 리사이즈: 행 이동 방지
        previewStartCol = Math.min(dragState.currentPos.col, originalEndCol);
        previewEndCol = originalEndCol;
        previewRow = originalTask.row; // 리사이즈 시에는 원래 행 유지
      } else if (dragState.dragType === "resize-end") {
        // 끝점 리사이즈: 행 이동 방지
        previewStartCol = originalStartCol;
        previewEndCol = Math.max(dragState.currentPos.col, originalStartCol);
        previewRow = originalTask.row; // 리사이즈 시에는 원래 행 유지
      } else {
        return null;
      }

      // 유효한 범위 체크
      if (
        previewStartCol < 0 ||
        previewEndCol >= dates.length ||
        previewStartCol > previewEndCol
      ) {
        return null;
      }

      console.log("Drag preview:", {
        taskId: originalTask.id,
        dragType: dragState.dragType,
        originalRow: originalTask.row,
        previewRow,
        previewStartCol,
        previewEndCol,
        clickOffset,
      });

      return {
        ...originalTask,
        row: previewRow,
        startCol: previewStartCol,
        endCol: previewEndCol,
        startDate: dates[previewStartCol],
        endDate: dates[previewEndCol],
      };
    }, [dragState, tasks, dates]);

    // 드래그 영역 셀들 최적화
    const dragAreaCells = useMemo(() => {
      if (
        !dragState.isDragging ||
        dragState.dragType !== "new" ||
        !dragState.currentPos ||
        !dragState.startPos
      )
        return [];

      const cells = [];
      const minRow = Math.min(dragState.startPos.row, dragState.currentPos.row);
      const maxRow = Math.max(dragState.startPos.row, dragState.currentPos.row);
      const minCol = Math.min(dragState.startPos.col, dragState.currentPos.col);
      const maxCol = Math.max(dragState.startPos.col, dragState.currentPos.col);

      for (let rowIndex = minRow; rowIndex <= maxRow; rowIndex++) {
        for (let colIndex = minCol; colIndex <= maxCol; colIndex++) {
          if (isCellInDragArea(rowIndex, colIndex, dragState)) {
            cells.push({ rowIndex, colIndex });
          }
        }
      }

      return cells;
    }, [dragState]);

    // 드래그 선택 영역 셀들 최적화
    const dragSelectionCells = useMemo(() => {
      if (
        !dragSelection.isSelected ||
        !dragSelection.startPos ||
        !dragSelection.endPos
      )
        return [];

      const cells = [];
      const minRow = Math.min(
        dragSelection.startPos.row,
        dragSelection.endPos.row
      );
      const maxRow = Math.max(
        dragSelection.startPos.row,
        dragSelection.endPos.row
      );
      const minCol = Math.min(
        dragSelection.startPos.col,
        dragSelection.endPos.col
      );
      const maxCol = Math.max(
        dragSelection.startPos.col,
        dragSelection.endPos.col
      );

      for (let rowIndex = minRow; rowIndex <= maxRow; rowIndex++) {
        for (let colIndex = minCol; colIndex <= maxCol; colIndex++) {
          if (isCellInDragSelection(rowIndex, colIndex, dragSelection)) {
            cells.push({ rowIndex, colIndex });
          }
        }
      }

      return cells;
    }, [dragSelection]);

    return (
      <div
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          width: containerWidth,
          height: containerHeight,
          zIndex: 2,
        }}
      >
        {/* 태스크 렌더링 */}
        {tasks.map((task) => {
          const startCol = dates.indexOf(task.startDate);
          const endCol = dates.indexOf(task.endDate);

          if (startCol === -1 || endCol === -1) return null;

          const width = (endCol - startCol + 1) * CELL_WIDTH;
          const x = startCol * CELL_WIDTH;
          const y = task.row * CELL_HEIGHT;

          return (
            <TaskItem
              key={task.id}
              task={task}
              x={x}
              y={y}
              width={width}
              startCol={startCol}
              endCol={endCol}
              dragState={dragState}
              onMouseDown={onMouseDown}
              onMouseEnter={onMouseEnter}
              onTaskClick={onTaskClick}
              onResizeStart={onResizeStart}
              onResizeEnd={onResizeEnd}
              onContextMenu={onContextMenu}
            />
          );
        })}

        {/* 드래그 중인 태스크 미리보기 */}
        {dragState.isDragging && dragState.currentPos && dragPreviewTask && (
          <div
            className="absolute"
            style={{
              zIndex: 20,
            }}
          >
            <div
              className="absolute pointer-events-none animate-pulse"
              style={{
                left: dragPreviewTask.startCol * CELL_WIDTH,
                top: dragPreviewTask.row * CELL_HEIGHT,
                width:
                  (dragPreviewTask.endCol - dragPreviewTask.startCol + 1) *
                  CELL_WIDTH,
                height: CELL_HEIGHT,
                backgroundColor: dragPreviewTask.color,
                border: "2px dashed rgba(0,0,0,0.6)",
                borderRadius: "4px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                transform: "scale(1.02)",
              }}
            >
              {/* 미리보기 텍스트 */}
              <div className="flex items-center h-full px-2 text-xs font-medium text-white text-shadow">
                {dragPreviewTask.name}
              </div>
            </div>
          </div>
        )}

        {/* 새 태스크 드래그 영역 표시 */}
        {dragState.isDragging && dragState.dragType === "new" && (
          <div
            className="absolute"
            style={{
              zIndex: 15,
            }}
          >
            {dragAreaCells.map(({ rowIndex, colIndex }) => {
              return (
                <div
                  key={`drag-area-${rowIndex}-${colIndex}`}
                  className="absolute pointer-events-none"
                  style={{
                    left: colIndex * CELL_WIDTH,
                    top: rowIndex * CELL_HEIGHT,
                    width: CELL_WIDTH,
                    height: CELL_HEIGHT,
                    backgroundColor: "rgba(59, 130, 246, 0.3)",
                    border: "1px solid rgba(59, 130, 246, 0.5)",
                  }}
                />
              );
            })}
          </div>
        )}

        {/* 드래그 선택 영역 표시 */}
        {dragSelection.isSelected && (
          <div
            className="absolute"
            style={{
              zIndex: 15,
            }}
          >
            {dragSelectionCells.map(({ rowIndex, colIndex }) => {
              return (
                <div
                  key={`selection-${rowIndex}-${colIndex}`}
                  className="absolute pointer-events-none"
                  style={{
                    left: colIndex * CELL_WIDTH,
                    top: rowIndex * CELL_HEIGHT,
                    width: CELL_WIDTH,
                    height: CELL_HEIGHT,
                    backgroundColor: "rgba(34, 197, 94, 0.2)",
                    border: "1px solid rgba(34, 197, 94, 0.5)",
                  }}
                />
              );
            })}
          </div>
        )}

        {/* 투명한 상호작용 레이어 */}
        <div
          className="absolute top-0 left-0 pointer-events-auto"
          style={{
            width: containerWidth,
            height: containerHeight,
            zIndex: 5,
          }}
          onMouseDown={(e) => {
            // 빈 영역 클릭 처리 - 전체 레이어에서 처리
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const col = Math.floor(x / CELL_WIDTH);
            const row = Math.floor(y / CELL_HEIGHT);

            if (
              col >= 0 &&
              col < dates.length &&
              row >= 0 &&
              row < rows.length
            ) {
              // 태스크가 있는 셀인지 확인
              const existingTask = getTaskForCell(row, col, tasks, dates);
              if (!existingTask) {
                onMouseDown(row, col, e);
              }
            }
          }}
          onMouseEnter={(e) => {
            // 마우스 엔터 처리
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const col = Math.floor(x / CELL_WIDTH);
            const row = Math.floor(y / CELL_HEIGHT);

            if (
              col >= 0 &&
              col < dates.length &&
              row >= 0 &&
              row < rows.length
            ) {
              onMouseEnter(row, col);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            // 우클릭 처리
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const col = Math.floor(x / CELL_WIDTH);
            const row = Math.floor(y / CELL_HEIGHT);

            if (
              col >= 0 &&
              col < dates.length &&
              row >= 0 &&
              row < rows.length
            ) {
              console.log("Empty cell right click:", { row, col });
              if (onContextMenu) {
                onContextMenu(row, col, e);
              }
            }
          }}
        />
      </div>
    );
  }
);

GanttTaskLayer.displayName = "GanttTaskLayer";
