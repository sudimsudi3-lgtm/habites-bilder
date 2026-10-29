import React, { useState, useRef } from 'react';
import { UserSettings, StorageDataV1 } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import { 
  User, 
  Moon, 
  Calendar, 
  Globe, 
  Bell, 
  Volume2, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Sparkles, 
  Check, 
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { 
  canUseNotifications, 
  requestNotificationPermission, 
  sendHabitNotification, 
  playCompletionSound 
} from '../utils/notificationUtils';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onExportData: () => void;
  onImportData: (file: File) => Promise<{ success: boolean; error?: string }>;
  onLoadDemo: () => void;
  onResetData: () => void;
  onReplayOnboarding: () => void;
  t: TranslationDictionary;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onLoadDemo,
  onResetData,
  onReplayOnboarding,
  t,
}) => {
  const [displayName, setDisplayName] = useState(settings.displayName);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({ displayName: displayName.trim() || 'Consistency Seeker' });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handleTestNotification = async () => {
    if (!canUseNotifications()) {
      alert('Browser notifications are not supported in this browser.');
      return;
    }
    const granted = await requestNotificationPermission();
    if (granted) {
      sendHabitNotification(
        'Habit Builder AI: Reminder Preview',
        'Consistency test: Time to review your habits for today!'
      );
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await onImportData(file);
    if (res.success) {
      setImportStatus({ message: 'Data imported successfully!', isError: false });
    } else {
      setImportStatus({ message: res.error || 'Failed to import JSON.', isError: true });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setImportStatus(null), 4000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#F3F4F6] tracking-tight">{t.settings.title}</h1>
        <p className="text-xs text-[#9CA3AF] mt-1">{t.settings.subtitle}</p>
      </div>

      {/* 1. User Profile */}
      <div className="bg-[#151925] border border-[#293043] rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[#8B5CF6]" />
          <h2 className="text-base font-bold text-[#F3F4F6]">{t.settings.profile}</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
              {t.settings.displayName}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Maya, Alex, Consistency Champion"
                className="w-full bg-[#10131B] border border-[#293043] rounded-xl px-3.5 py-2 text-xs text-[#F3F4F6] focus:border-[#8B5CF6] focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold shrink-0 transition"
              >
                {t.settings.saveChanges}
              </button>
            </div>
            {isSavedNotice && (
              <span className="text-[11px] text-[#34D399] font-medium flex items-center gap-1 mt-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Profile updated successfully!</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 2. Preferences & Localization */}
      <div className="bg-[#151925] border border-[#293043] rounded-3xl p-6 space-y-5">
        <h2 className="text-base font-bold text-[#F3F4F6]">{t.settings.preferences}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Week Start Day */}
          <div className="p-4 bg-[#10131B] border border-[#293043] rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F3F4F6]">
              <Calendar className="w-4 h-4 text-[#22D3EE]" />
              <span>{t.settings.weekStart}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ weekStartsOn: 1 })}
                className={`py-2 px-3 text-xs rounded-xl border font-medium transition ${
                  settings.weekStartsOn === 1
                    ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#A78BFA]'
                    : 'bg-[#151925] border-[#293043] text-[#9CA3AF]'
                }`}
              >
                Monday (Default)
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ weekStartsOn: 0 })}
                className={`py-2 px-3 text-xs rounded-xl border font-medium transition ${
                  settings.weekStartsOn === 0
                    ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#A78BFA]'
                    : 'bg-[#151925] border-[#293043] text-[#9CA3AF]'
                }`}
              >
                Sunday
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="p-4 bg-[#10131B] border border-[#293043] rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F3F4F6]">
              <Globe className="w-4 h-4 text-[#8B5CF6]" />
              <span>{t.settings.language}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'en' as const, label: 'English' },
                { id: 'roman_ur' as const, label: 'Roman Urdu' },
                { id: 'ur' as const, label: 'اردو' },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onUpdateSettings({ language: l.id })}
                  className={`py-2 px-2 text-xs rounded-xl border font-medium transition ${
                    settings.language === l.id
                      ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#A78BFA]'
                      : 'bg-[#151925] border-[#293043] text-[#9CA3AF]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audio Effects Toggle */}
        <div className="p-4 bg-[#10131B] border border-[#293043] rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#34D399]/15 text-[#34D399] flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F3F4F6]">Completion Sound Effects</div>
              <div className="text-[11px] text-[#9CA3AF]">
                Play a subtle harmonic audio chime when marking habits complete
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => playCompletionSound()}
              className="text-[11px] font-semibold text-[#A78BFA] hover:text-[#F3F4F6] px-2 py-1 rounded-lg bg-[#151925] border border-[#293043]"
            >
              Test Sound
            </button>
            <input
              type="checkbox"
              checked={settings.soundEffectsEnabled}
              onChange={(e) => onUpdateSettings({ soundEffectsEnabled: e.target.checked })}
              className="w-4 h-4 rounded-sm bg-[#151925] border-[#293043] text-[#8B5CF6]"
            />
          </div>
        </div>
      </div>

      {/* 3. Notifications */}
      <div className="bg-[#151925] border border-[#293043] rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#22D3EE]" />
            <h2 className="text-base font-bold text-[#F3F4F6]">{t.settings.notifications}</h2>
          </div>
          <button
            onClick={handleTestNotification}
            className="px-3 py-1.5 rounded-xl bg-[#10131B] border border-[#293043] text-xs font-semibold text-[#22D3EE] hover:bg-[#1A2030] transition"
          >
            {t.settings.testNotification}
          </button>
        </div>

        <p className="text-xs text-[#9CA3AF] leading-relaxed">
          Browser notifications require user authorization. When active, you will receive timely prompts for scheduled routines. (Note: standard browser notifications require the tab to be open or active in background).
        </p>
      </div>

      {/* 4. Data Management & Backups (Parts 11 & 13) */}
      <div className="bg-[#151925] border border-[#293043] rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-[#34D399]" />
          <h2 className="text-base font-bold text-[#F3F4F6]">{t.settings.dataManagement}</h2>
        </div>

        <p className="text-xs text-[#9CA3AF] leading-relaxed">
          Your habits and completions are stored strictly in this browser using schema version 1. You can export a full JSON backup anytime or import previous records.
        </p>

        {importStatus && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium ${
              importStatus.isError
                ? 'bg-[#F87171]/15 border-[#F87171]/30 text-[#F87171]'
                : 'bg-[#34D399]/15 border-[#34D399]/30 text-[#34D399]'
            }`}
          >
            {importStatus.message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export JSON */}
          <button
            onClick={onExportData}
            className="p-4 bg-[#10131B] border border-[#293043] hover:border-[#8B5CF6] rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition group"
          >
            <Download className="w-5 h-5 text-[#8B5CF6] group-hover:scale-110 transition" />
            <div>
              <div className="text-xs font-bold text-[#F3F4F6]">{t.settings.exportJson}</div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5">Download full dataset</div>
            </div>
          </button>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-[#10131B] border border-[#293043] hover:border-[#22D3EE] rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition group"
          >
            <Upload className="w-5 h-5 text-[#22D3EE] group-hover:scale-110 transition" />
            <div>
              <div className="text-xs font-bold text-[#F3F4F6]">{t.settings.importJson}</div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5">Restore from backup</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </button>

          {/* Load Sample Demo Dataset */}
          <button
            onClick={onLoadDemo}
            className="p-4 bg-[#10131B] border border-[#293043] hover:border-[#FBBF24] rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition group"
          >
            <Sparkles className="w-5 h-5 text-[#FBBF24] group-hover:scale-110 transition" />
            <div>
              <div className="text-xs font-bold text-[#F3F4F6]">{t.settings.loadDemo}</div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5">14-day sample history</div>
            </div>
          </button>
        </div>

        {/* Guided Onboarding & Reset Actions */}
        <div className="pt-4 border-t border-[#293043] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            onClick={onReplayOnboarding}
            className="px-4 py-2 rounded-xl bg-[#10131B] border border-[#293043] text-xs font-semibold text-[#A78BFA] hover:bg-[#1A2030] transition flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-[#8B5CF6]" />
            <span>Replay Onboarding Guide</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 rounded-xl bg-[#F87171]/10 border border-[#F87171]/30 text-xs font-semibold text-[#F87171] hover:bg-[#F87171]/20 transition flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.settings.resetAll}</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#151925] border border-[#293043] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-[#F87171]/15 text-[#F87171] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#F3F4F6]">{t.settings.resetAll}?</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                {t.settings.resetWarning} All custom habits, streaks, and completion notes will be erased.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:bg-[#1A2030]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#F87171] hover:bg-[#EF4444] text-white shadow-md transition"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
