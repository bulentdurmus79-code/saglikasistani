
import React from 'react';
import { Task, TaskType } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { speak } from '../services/ttsService';

interface TaskCardProps {
  task: Task;
}

const TaskIcon: React.FC<{ type: TaskType }> = ({ type }) => {
  const iconClass = "w-6 h-6 mr-3";
  switch (type) {
    case TaskType.Medication:
      return <i className={`fa-solid fa-pills text-blue-500 ${iconClass}`}></i>;
    case TaskType.Measurement:
      return <i className={`fa-solid fa-heart-pulse text-red-500 ${iconClass}`}></i>;
    case TaskType.Activity:
      return <i className={`fa-solid fa-person-walking text-green-500 ${iconClass}`}></i>;
    case TaskType.Appointment:
        return <i className={`fa-solid fa-calendar-check text-purple-500 ${iconClass}`}></i>;
    default:
      return <i className={`fa-solid fa-clipboard-list text-gray-500 ${iconClass}`}></i>;
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { updateTask } = useAppStore();
  const triggerHaptic = useHapticFeedback();
  
  const handleToggleComplete = () => {
    updateTask(task.id, { isCompleted: !task.isCompleted });
    triggerHaptic(100);
  };

  const textToRead = `${task.title}. Saat ${task.time}. ${task.notes || ''}`;

  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4 transition-all duration-300 ${task.isCompleted ? 'opacity-50' : ''}`}>
      {task.isCritical && !task.isCompleted && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-danger rounded-full animate-pulse"></div>
      )}
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-1">
          <TaskIcon type={task.type} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{task.title}</p>
              <p className="text-primary dark:text-primary-300 font-semibold text-md">{task.time}</p>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={() => speak(textToRead)} className="text-gray-400 hover:text-primary dark:hover:text-primary-300">
                    <i className="fa-solid fa-volume-high"></i>
                </button>
                <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={handleToggleComplete}
                    className="w-7 h-7 rounded-full text-secondary focus:ring-secondary border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
            </div>
          </div>
          {task.notes && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{task.notes}</p>}
          {task.medicationImage && (
            <div className="mt-3">
              <img src={task.medicationImage} alt={task.title} className="rounded-lg max-h-40 w-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
