"use client";

import React from "react";
import { Task, DragState, DragSelection } from "@/types/gantt-types";
import { CELL_WIDTH, CELL_HEIGHT } from "@/_constants/gantt-constants";
import { getTaskForCell } from "@/_utils/task-utils";
import {
  isCellInDragArea,
  isCellInDragSelection,
  getTaskPreview,
} from "@/_utils/drag-utils";

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

export const GanttTaskLayer: React.FC<GanttTaskLayerProps> = ({
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
          <div
            key={task.id}
            className="absolute pointer-events-auto cursor-pointer group"
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
            onMouseDown={(e) => onMouseDown(task.row, startCol, e)}
            onMouseEnter={() => onMouseEnter(task.row, startCol)}
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
      })}

      {/* 드래그 중인 태스크 미리보기 */}
      {dragState.isDragging && dragState.currentPos && (
        <div
          className="absolute"
          style={{
            zIndex: 20,
          }}
        >
          {dates.map((_, colIndex) =>
            rows.map((_, rowIndex) => {
              const preview = getTaskPreview(
                rowIndex,
                colIndex,
                dragState,
                tasks,
                dates
              );
              if (!preview) return null;

              const startCol = dates.indexOf(preview.startDate);
              const endCol = dates.indexOf(preview.endDate);
              const width = (endCol - startCol + 1) * CELL_WIDTH;
              const x = colIndex * CELL_WIDTH;
              const y = rowIndex * CELL_HEIGHT;

              return (
                <div
                  key={`preview-${rowIndex}-${colIndex}`}
                  className="absolute pointer-events-none"
                  style={{
                    left: x,
                    top: y,
                    width: width,
                    height: CELL_HEIGHT,
                    backgroundColor: preview.color,
                    border: "2px dashed rgba(0,0,0,0.4)",
                    borderRadius: "4px",
                    opacity: 0.6,
                  }}
                />
              );
            })
          )}
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
          {dates.map((_, colIndex) =>
            rows.map((_, rowIndex) => {
              if (!isCellInDragArea(rowIndex, colIndex, dragState)) return null;

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
            })
          )}
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
          {dates.map((_, colIndex) =>
            rows.map((_, rowIndex) => {
              if (!isCellInDragSelection(rowIndex, colIndex, dragSelection))
                return null;

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
            })
          )}
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
      >
        {rows.map((_, rowIndex) =>
          dates.map((_, colIndex) => {
            // 태스크가 있는 셀은 상호작용 비활성화
            const existingTask = getTaskForCell(
              rowIndex,
              colIndex,
              tasks,
              dates
            );
            if (existingTask) return null;

            return (
              <div
                key={`interaction-${rowIndex}-${colIndex}`}
                className="absolute"
                style={{
                  left: colIndex * CELL_WIDTH,
                  top: rowIndex * CELL_HEIGHT,
                  width: CELL_WIDTH,
                  height: CELL_HEIGHT,
                }}
                onMouseDown={(e) => onMouseDown(rowIndex, colIndex, e)}
                onMouseEnter={() => onMouseEnter(rowIndex, colIndex)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  console.log("Empty cell right click:", {
                    row: rowIndex,
                    col: colIndex,
                  });
                  if (onContextMenu) {
                    onContextMenu(rowIndex, colIndex, e);
                  }
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
