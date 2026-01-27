import { useState } from 'react';
import { CURRENCIES } from '../utils/currency';
import { backupService } from '../utils/backup';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface SettingsPageProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

export default function SettingsPage({ currency, onCurrencyChange }: SettingsPageProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      await backupService.exportData();
    } catch (error) {
      alert(t.failedToExportData);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm(`${t.warning}: ${t.restoreWarning}`)) {
      event.target.value = ''; // Reset input
      return;
    }

    setIsProcessing(true);
    try {
      await backupService.importData(file);
      alert(t.reloadSuccess);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert(t.failedToRestoreData);
      event.target.value = ''; // Reset input
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>{t.settings}</h1>
        <p className="page-subtitle">{t.settingsSubtitle}</p>
      </div>

      <div className="settings-sections">
        <div className="settings-section">
          <h2>{t.appearance}</h2>
          <div className="settings-item">
            <label>{t.language}</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="settings-select"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          <div className="settings-item">
            <label>{t.darkMode}</label>
            <button
              className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? `🌙 ${t.on}` : `☀️ ${t.off}`}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2>{t.currency}</h2>
          <div className="settings-item">
            <label htmlFor="currency-setting">{t.defaultCurrency}</label>
            <select
              id="currency-setting"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="settings-select"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code} - {curr.name}
                </option>
              ))}
            </select>
            <p className="settings-description">{t.currencyDescription}</p>
          </div>
        </div>

        <div className="settings-section">
          <h2>{t.backupRestore}</h2>
          <div className="settings-item">
            <label>{t.backupRestore}</label>
            <p className="settings-description">
              {t.backupRestoreDescription || 'Securely backup your entire dataset to a JSON file or restore from a previous backup.'}
              <br />
              <strong className="text-warning">{t.warning}: {t.restoreWarning}</strong>
            </p>
            <div className="settings-actions">
              <button
                onClick={handleExport}
                className="btn btn-secondary"
                disabled={isProcessing}
              >
                📥 {t.downloadBackup}
              </button>

              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="backup-file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isProcessing}
                  className="hidden-input"
                />
                <label htmlFor="backup-file" className={`btn btn-secondary ${isProcessing ? 'disabled' : ''}`}>
                  📤 {t.restoreBackup}
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>{t.about}</h2>
          <div className="settings-item">
            <p className="settings-description">
              Income Tracker v1.0.0<br />
              {t.aboutDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

