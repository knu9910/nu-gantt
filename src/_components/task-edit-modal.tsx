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
import { TaskEditModalProps } from "../types/gantt-types";

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  show,
  task,
  onSave,
  onCancel,
}) => {
  const [taskName, setTaskName] = useState("");

  useEffect(() => {
    if (task) {
      setTaskName(task.name || "");
    }
  }, [task]);

  const handleSave = () => {
    if (task) {
      onSave(task.id, taskName.trim());
      setTaskName("");
    }
  };

  const handleCancel = () => {
    onCancel();
    setTaskName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && handleCancel()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/20 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-[425px] shadow-xl border-0 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              태스크 편집
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
