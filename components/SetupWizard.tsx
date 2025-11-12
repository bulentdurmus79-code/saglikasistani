
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { FamilyGroup, Profile, Role } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const SetupWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [setupType, setSetupType] = useState<'self' | 'relative' | null>(null);
  const [names, setNames] = useState({ self: '', relative: '' });
  const initialize = useAppStore((state) => state.initialize);

  const handleSetup = () => {
    const groupId = uuidv4();
    let profiles: Profile[] = [];
    let currentUserId = '';

    if (setupType === 'self') {
      const selfProfile: Profile = { id: uuidv4(), name: names.self, role: Role.Patient, avatar: '👤' };
      profiles.push(selfProfile);
      currentUserId = selfProfile.id;
    } else if (setupType === 'relative') {
      const caregiverProfile: Profile = { id: uuidv4(), name: names.self, role: Role.Caregiver, avatar: ' देखभाल करने वाला' };
      const patientProfile: Profile = { id: uuidv4(), name: names.relative, role: Role.Patient, avatar: '👤' };
      profiles.push(caregiverProfile, patientProfile);
      currentUserId = caregiverProfile.id;
    }

    const newFamilyGroup: FamilyGroup = {
      id: groupId,
      profiles,
      tasks: [],
    };

    initialize(newFamilyGroup, currentUserId);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md text-center">
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-primary dark:text-primary-300 mb-2">Asistan'a Hoş Geldiniz</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Bu kurulumu kimin için yapıyorsunuz?</p>
            <div className="space-y-4">
              <button
                onClick={() => { setSetupType('self'); setStep(2); }}
                className="w-full text-lg bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300"
              >
                Kendim İçin
              </button>
              <button
                onClick={() => { setSetupType('relative'); setStep(2); }}
                className="w-full text-lg bg-secondary hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300"
              >
                Bir Yakınım İçin
              </button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold text-primary dark:text-primary-300 mb-6">Profil Bilgileri</h2>
            {setupType === 'self' && (
              <input
                type="text"
                value={names.self}
                onChange={(e) => setNames({ ...names, self: e.target.value })}
                placeholder="Adınız"
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            )}
            {setupType === 'relative' && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={names.self}
                  onChange={(e) => setNames({ ...names, self: e.target.value })}
                  placeholder="Sizin Adınız (Bakım Veren)"
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  value={names.relative}
                  onChange={(e) => setNames({ ...names, relative: e.target.value })}
                  placeholder="Yakınınızın Adı (Takip Edilen)"
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}
            <button
              onClick={handleSetup}
              disabled={setupType === 'self' ? !names.self : !names.self || !names.relative}
              className="mt-6 w-full text-lg bg-accent hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-400"
            >
              Kurulumu Tamamla
            </button>
          </>
        )}
      </div>
    </div>
  );
};
