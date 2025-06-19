"use client";

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { ColumnSelection, MonthSelection } from "@/types/gantt-types";
import { CELL_WIDTH, CELL_HEIGHT } from "@/_constants/gantt-constants";

interface GanttGridCanvasProps {
  dates: string[];
  rows: string[];
  holidays: string[];
  columnSelection: ColumnSelection;
  monthSelection: MonthSelection;
  onCellClick?: (row: number, col: number, e: React.MouseEvent) => void;
  onCellRightClick?: (row: number, col: number, e: React.MouseEvent) => void;
}

export const GanttGridCanvas: React.FC<GanttGridCanvasProps> = React.memo(
  ({
    dates,
    rows,
    holidays,
    columnSelection,
    monthSelection,
    onCellClick,
    onCellRightClick,
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    // 캔버스 크기 계산
    const canvasWidth = dates.length * CELL_WIDTH;
    const canvasHeight = rows.length * CELL_HEIGHT;

    // 휴일 인덱스 맵 생성 (성능 최적화)
    const holidayIndexMap = useMemo(() => {
      const map = new Set<number>();
      holidays.forEach((holiday) => {
        const index = dates.indexOf(holiday);
        if (index !== -1) map.add(index);
      });
      return map;
    }, [holidays, dates]);

    // 주말 인덱스 맵 생성 (성능 최적화)
    const weekendIndexMap = useMemo(() => {
      const map = new Set<number>();
      dates.forEach((date, index) => {
        const dayOfWeek = new Date(date).getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          map.add(index);
        }
      });
      return map;
    }, [dates]);

    // 오늘 날짜 인덱스
    const todayIndex = useMemo(() => {
      const today = new Date().toISOString().split("T")[0];
      return dates.indexOf(today);
    }, [dates]);

    // 격자 그리드 그리기 함수
    const drawGrid = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 고해상도 디스플레이 지원
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvasWidth;
      const displayHeight = canvasHeight;

      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      ctx.scale(dpr, dpr);

      // 캔버스 초기화
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // 배경색 설정
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // 격자 그리기
      ctx.strokeStyle = "#e5e7eb"; // gray-200
      ctx.lineWidth = 1;

      // 세로선 그리기
      for (let col = 0; col <= dates.length; col++) {
        const x = col * CELL_WIDTH;
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, displayHeight);
        ctx.stroke();
      }

      // 가로선 그리기
      for (let row = 0; row <= rows.length; row++) {
        const y = row * CELL_HEIGHT;
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(displayWidth, y + 0.5);
        ctx.stroke();
      }

      // 공휴일 배경 그리기
      holidayIndexMap.forEach((index) => {
        const x = index * CELL_WIDTH;
        ctx.fillStyle = "rgba(239, 68, 68, 0.1)"; // red-500 with 10% opacity
        ctx.fillRect(x, 0, CELL_WIDTH, displayHeight);
      });

      // 주말 배경 그리기
      weekendIndexMap.forEach((index) => {
        const x = index * CELL_WIDTH;
        ctx.fillStyle = "rgba(156, 163, 175, 0.1)"; // gray-400 with 10% opacity
        ctx.fillRect(x, 0, CELL_WIDTH, displayHeight);
      });

      // 오늘 날짜 하이라이트
      if (todayIndex !== -1) {
        const x = todayIndex * CELL_WIDTH;
        ctx.fillStyle = "rgba(59, 130, 246, 0.2)"; // blue-500 with 20% opacity
        ctx.fillRect(x, 0, CELL_WIDTH, displayHeight);
      }

      // 선택된 열 하이라이트
      if (
        columnSelection.isSelected &&
        columnSelection.selectedColumn !== null
      ) {
        const x = columnSelection.selectedColumn * CELL_WIDTH;
        ctx.fillStyle = "rgba(34, 197, 94, 0.2)"; // green-500 with 20% opacity
        ctx.fillRect(x, 0, CELL_WIDTH, displayHeight);
      }

      // 선택된 월 하이라이트
      if (monthSelection.isSelected && monthSelection.selectedMonth !== null) {
        const startX = monthSelection.startIndex * CELL_WIDTH;
        const width =
          (monthSelection.endIndex - monthSelection.startIndex + 1) *
          CELL_WIDTH;
        ctx.fillStyle = "rgba(168, 85, 247, 0.2)"; // purple-500 with 20% opacity
        ctx.fillRect(startX, 0, width, displayHeight);
      }
    }, [
      dates,
      rows,
      holidays,
      columnSelection,
      monthSelection,
      canvasWidth,
      canvasHeight,
      holidayIndexMap,
      weekendIndexMap,
      todayIndex,
    ]);

    // 캔버스 그리기 - requestAnimationFrame으로 최적화
    useEffect(() => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(drawGrid);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [drawGrid]);

    // 마우스 이벤트 핸들러
    const handleMouseEvent = (
      e: React.MouseEvent,
      handler?: (row: number, col: number, e: React.MouseEvent) => void
    ) => {
      if (!handler || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const container = canvas.closest(".overflow-auto");

      // 스크롤 오프셋 고려
      const scrollLeft = container?.scrollLeft || 0;
      const scrollTop = container?.scrollTop || 0;

      const x = e.clientX - rect.left + scrollLeft;
      const y = e.clientY - rect.top + scrollTop;

      const col = Math.floor(x / CELL_WIDTH);
      const row = Math.floor(y / CELL_HEIGHT);

      if (col >= 0 && col < dates.length && row >= 0 && row < rows.length) {
        handler(row, col, e);
      }
    };

    const handleClick = (e: React.MouseEvent) => {
      handleMouseEvent(e, onCellClick);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      handleMouseEvent(e, onCellRightClick);
    };

    return (
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-auto"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          zIndex: 0,
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      />
    );
  }
);

GanttGridCanvas.displayName = "GanttGridCanvas";
