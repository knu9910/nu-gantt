import React from "react";
import { formatDateToKorean } from "../_utils/date-utils";
import { isColumnSelected } from "../_utils/selection-utils";
import { ColumnSelection } from "./gantt-chart";

interface GanttHeaderProps {
  dates: string[];
  columnSelection: ColumnSelection;
  onColumnClick: (colIndex: number, e: React.MouseEvent) => void;
}

export const GanttHeader: React.FC<GanttHeaderProps> = ({
  dates,
  columnSelection,
  onColumnClick,
}) => {
  return (
    <div className="sticky top-0 bg-white z-10">
      <div className="flex">
        {dates.map((date, colIndex) => (
          <div
            key={date}
            className={`
              min-w-[60px] h-12 p-2 border-r border-b border-gray-300 text-xs font-medium text-center cursor-pointer
              ${
                isColumnSelected(columnSelection, colIndex)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-50 hover:bg-gray-200"
              }
            `}
            onClick={(e) => onColumnClick(colIndex, e)}
          >
            {formatDateToKorean(date)}
          </div>
        ))}
      </div>
    </div>
  );
};
