"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TaskEditModalProps } from "@/types/gantt-types";

export const TaskEditModal = ({
  show,
  task,
  onSave,
  onCancel,
}: TaskEditModalProps) => {
  const [taskName, setTaskName] = useState("");
  const [taskColor, setTaskColor] = useState("#3b82f6");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (task) {
      setTaskName(task.name || "");
      setTaskColor(task.color || "#3b82f6");
      setStartDate(task.startDate || "");
      setEndDate(task.endDate || "");
    }
  }, [task]);

  const handleSave = () => {
    if (task && taskName.trim() && startDate && endDate) {
      onSave(task.id, {
        name: taskName.trim(),
        color: taskColor,
        startDate: startDate,
        endDate: endDate,
      });
      resetForm();
    }
  };

  const handleCancel = () => {
    onCancel();
    resetForm();
  };

  const resetForm = () => {
    setTaskName("");
    setTaskColor("#3b82f6");
    setStartDate("");
    setEndDate("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const isValidForm =
    taskName.trim() && startDate && endDate && startDate <= endDate;

  return (
    <Dialog open={show} onOpenChange={(open) => !open && handleCancel()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/20 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-[500px] shadow-xl border-0 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              태스크 편집
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* 태스크명 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="taskName"
                className="text-right text-gray-700 font-medium"
              >
                태스크명
              </Label>
              <Input
                id="taskName"
                value={taskName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTaskName(e.target.value)
                }
                onKeyDown={handleKeyPress}
                className="col-span-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="태스크 이름을 입력하세요"
                autoFocus
              />
            </div>

            {/* 색상 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="taskColor"
                className="text-right text-gray-700 font-medium"
              >
                색상
              </Label>
              <div className="col-span-3 flex items-center gap-3">
                <Input
                  id="taskColor"
                  type="color"
                  value={taskColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTaskColor(e.target.value)
                  }
                  className="w-16 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded cursor-pointer"
                />
                <Input
                  value={taskColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTaskColor(e.target.value)
                  }
                  className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            {/* 시작일 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="startDate"
                className="text-right text-gray-700 font-medium"
              >
                시작일
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setStartDate(e.target.value)
                }
                className="col-span-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* 종료일 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="endDate"
                className="text-right text-gray-700 font-medium"
              >
                종료일
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEndDate(e.target.value)
                }
                className="col-span-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* 유효성 검사 메시지 */}
            {startDate && endDate && startDate > endDate && (
              <div className="col-span-4 text-sm text-red-600 text-center">
                시작일은 종료일보다 이전이어야 합니다.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValidForm}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
