import React, { useState, useEffect, useRef } from "react";
import { Task } from "./gantt-chart";

interface TaskEditModalProps {
  show: boolean;
  task: Task | null;
  onSave: (taskId: string, newName: string) => void;
  onCancel: () => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  show,
  task,
  onSave,
  onCancel,
}) => {
  const [taskName, setTaskName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (show && task) {
      setTaskName(task.name);
      // 모달이 열릴 때 입력 필드에 포커스
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [show, task]);

  const handleSave = () => {
    if (task && taskName.trim()) {
      onSave(task.id, taskName.trim());
      setTaskName("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleCancel = () => {
    setTaskName("");
    onCancel();
  };

  if (!show || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">태스크 이름 변경</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            태스크 이름
          </label>
          <input
            ref={inputRef}
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="태스크 이름을 입력하세요"
          />
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: task.color }}
          />
          <span className="text-sm text-gray-600">
            {task.startDate} ~ {task.endDate} (행 {task.row + 1})
          </span>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!taskName.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};
