import { scrollToToday } from "@/_utils/scroll-utils";
import { clearMonthSelection } from "@/_utils/selection-utils";
import { ColumnSelection, MonthSelection } from "@/types/gantt-types";
import React from "react";

interface TodayButtonProps {
  ganttRef: React.RefObject<HTMLDivElement | null>;
  dates: string[];
  setMonthSelection: (selection: MonthSelection) => void;
  setColumnSelection: (selection: ColumnSelection) => void;
}

export const TodayButton = ({
  ganttRef,
  dates,
  setMonthSelection,
  setColumnSelection,
}: TodayButtonProps) => {
  const handleTodayClick = () => {
    // 월 선택 해제하고 오늘 날짜 열 선택
    setMonthSelection(clearMonthSelection());
    scrollToToday(ganttRef, dates, (columnIndex) => {
      setColumnSelection({
        isSelected: true,
        selectedColumn: columnIndex,
      });
    });
  };

  return (
    <button
      onClick={handleTodayClick}
      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center gap-1"
      title="오늘 날짜로 이동하고 선택"
    >
      📅 오늘로 가기
    </button>
  );
};
