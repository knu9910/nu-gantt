import React from "react";
import { GanttHeaderProps } from "../types/gantt-types";
import { isColumnSelected } from "../_utils/selection-utils";
import { CELL_WIDTH, DAY_HEADER_HEIGHT } from "../_constants/gantt-constants";
import { format } from "date-fns";

// 월별 그룹화 함수
const groupDatesByMonth = (dates: string[]) => {
  const monthGroups: { month: string; startIndex: number; count: number }[] =
    [];

  dates.forEach((date, index) => {
    const dateObj = new Date(date);
    const monthKey = `${format(dateObj, "yyyy년 MM월")}`;

    const lastGroup = monthGroups[monthGroups.length - 1];
    if (lastGroup && lastGroup.month === monthKey) {
      lastGroup.count++;
    } else {
      monthGroups.push({
        month: monthKey,
        startIndex: index,
        count: 1,
      });
    }
  });

  return monthGroups;
};

export const GanttHeader: React.FC<GanttHeaderProps> = ({
  dates,
  columnSelection,
  monthSelection,
  onColumnClick,
  onMonthClick,
}) => {
  const monthGroups = groupDatesByMonth(dates);

  return (
    <div className="sticky top-0 bg-white z-10">
      {/* 월 헤더 */}
      <div className="flex">
        {monthGroups.map((group, groupIndex) => (
          <div
            key={`month-${groupIndex}`}
            className={`
              border-r border-b border-gray-300 text-sm font-bold text-center py-2 cursor-pointer
              ${
                monthSelection.isSelected &&
                monthSelection.selectedMonth === group.month
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }
            `}
            style={{
              width: `${group.count * CELL_WIDTH}px`,
              minWidth: `${group.count * CELL_WIDTH}px`,
              maxWidth: `${group.count * CELL_WIDTH}px`,
            }}
            onClick={() =>
              onMonthClick(group.month, group.startIndex, group.count)
            }
          >
            {group.month}
          </div>
        ))}
      </div>

      {/* 일 헤더 (숫자만) */}
      <div className="flex">
        {dates.map((date, colIndex) => {
          const dateObj = new Date(date);
          const day = dateObj.getDate();

          // 월 선택 또는 열 선택 확인
          const isMonthSelected =
            monthSelection.isSelected &&
            colIndex >= monthSelection.startIndex &&
            colIndex <= monthSelection.endIndex;
          const isColumnSelectedSingle = isColumnSelected(
            columnSelection,
            colIndex
          );

          return (
            <div
              key={date}
              className={`
                border-r border-b border-gray-300 text-xs font-medium cursor-pointer flex items-center justify-center
                ${
                  isMonthSelected || isColumnSelectedSingle
                    ? "bg-blue-500 text-white"
                    : "bg-gray-50 hover:bg-gray-200"
                }
              `}
              style={{
                width: `${CELL_WIDTH}px`,
                height: `${DAY_HEADER_HEIGHT}px`,
                minWidth: `${CELL_WIDTH}px`,
                maxWidth: `${CELL_WIDTH}px`,
                textAlign: "center",
              }}
              onClick={(e) => onColumnClick(colIndex, e)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};
