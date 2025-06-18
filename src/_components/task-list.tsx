import React from "react";
import { Task } from "./gantt-chart";

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onDeleteTask }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">생성된 태스크</h3>
      {tasks.length === 0 ? (
        <p className="text-gray-500">생성된 태스크가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: task.color }}
                />
                <span className="font-medium">{task.name}</span>
                <span className="text-sm text-gray-600">
                  {task.startDate} ~ {task.endDate}
                </span>
                <span className="text-xs text-gray-500">
                  (행 {task.row + 1})
                </span>
              </div>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
