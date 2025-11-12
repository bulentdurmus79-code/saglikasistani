
import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { SetupWizard } from './components/SetupWizard';
import { Dashboard } from './components/Dashboard';
import { SOSButton } from './components/SOSButton';
import { Chatbot } from './components/Chatbot';
import { HomeIcon, UsersIcon, CogIcon } from './components/icons/Icons';
import { Role } from './types';

// A placeholder for a more complex component
const FamilyView: React.FC = () => <div className="p-4 text-gray-800 dark:text-gray-100">Aile Yönetimi (Bakım Veren) paneli burada olacak.</div>;
const SettingsView: React.FC = () => <div className="p-4 text-gray-800 dark:text-gray-100">Ayarlar paneli burada olacak.</div>;


const App: React.FC = () => {
  const { isSetupComplete, settings, familyGroup, currentUserId } = useAppStore();
  const [activeView, setActiveView] = useState('dashboard');

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.toggle('dark', isDark);
    root.classList.remove(isDark ? 'light' : 'dark');

    const baseFontSize = settings.fontSize === 'sm' ? '14px' : settings.fontSize === 'lg' ? '18px' : '16px';
    root.style.fontSize = baseFontSize;

  }, [settings.theme, settings.fontSize]);

  if (!isSetupComplete) {
    return <SetupWizard />;
  }

  const currentUser = familyGroup?.profiles.find(p => p.id === currentUserId);
  const isCaregiver = currentUser?.role === Role.Caregiver;

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'family':
        return <FamilyView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <main className="relative">
        {renderActiveView()}
        <SOSButton />
        <Chatbot />
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg flex justify-around">
        <button onClick={() => setActiveView('dashboard')} className={`flex flex-col items-center justify-center p-3 w-full ${activeView === 'dashboard' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
          <HomeIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Anasayfa</span>
        </button>
        {isCaregiver && (
          <button onClick={() => setActiveView('family')} className={`flex flex-col items-center justify-center p-3 w-full ${activeView === 'family' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
            <UsersIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Aile</span>
          </button>
        )}
        <button onClick={() => setActiveView('settings')} className={`flex flex-col items-center justify-center p-3 w-full ${activeView === 'settings' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
          <CogIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Ayarlar</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
