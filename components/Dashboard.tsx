
import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { TaskCard } from './TaskCard';
import { Task } from '../types';

export const Dashboard: React.FC = () => {
  const { familyGroup, currentUserId } = useAppStore();
  const currentUser = familyGroup?.profiles.find(p => p.id === currentUserId);
  
  if (!familyGroup || !currentUserId || !currentUser) {
    return <div className="p-4 text-center">Yükleniyor...</div>;
  }

  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = familyGroup.tasks
    .filter(task => task.profileId === currentUserId && task.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  const completedTasks = todaysTasks.filter(t => t.isCompleted).length;
  const totalTasks = todaysTasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="p-4 pb-24">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Merhaba, {currentUser.name}</h1>
        <p className="text-gray-500 dark:text-gray-400">Bugün için görevleriniz aşağıda.</p>
      </header>

      {totalTasks > 0 && (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Günlük İlerleme</span>
                <span className="text-sm font-medium text-secondary">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
      )}

      {todaysTasks.length > 0 ? (
        <div>
          {todaysTasks.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
      ) : (
        <div className="text-center py-10 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <i className="fa-solid fa-check-circle text-5xl text-secondary mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Harika!</h3>
            <p className="text-gray-500 dark:text-gray-400">Bugün için planlanmış bir göreviniz yok.</p>
        </div>
      )}
    </div>
  );
};
