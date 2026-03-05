import { useState, useEffect } from 'react';
import { CURRENCIES } from '../utils/currency';
import { backupService } from '../utils/backup';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

/* ── Inline Material Symbol helper ── */
const MIcon = ({ name, size = 20 }: { name: string; size?: number }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }}>{name}</span>
);

interface SettingsPageProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

export default function SettingsPage({ currency, onCurrencyChange }: SettingsPageProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, updateProfile } = useAuth();

  /* ── Profile Local State for form binding ── */
  const [formData, setFormData] = useState({
    name: user?.name || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: user?.bio || '',
    is2FA: user?.is2FA || false
  });

  // Sync internal state when user changes (e.g. after refresh or login)
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        bio: user.bio || '',
        is2FA: user.is2FA || false
      });
    }
  }, [user]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsProcessing(true);
    const success = await updateProfile({
      name: formData.name,
      firstName: formData.firstName,
      lastName: formData.lastName,
      bio: formData.bio,
      is2FA: formData.is2FA
    });

    setIsProcessing(false);
    if (success) {
      alert(t.settingsSaved || 'Settings saved successfully!');
    } else {
      alert(t.failedToSaveSettings || 'Failed to save settings.');
    }
  };

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
      event.target.value = '';
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
      event.target.value = '';
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div style={{ flex: 1 }}>
          <h1>{t.settings}</h1>
          <p className="page-subtitle">Manage your account details and application preferences.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={isProcessing} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MIcon name="save" size={18} /> {isProcessing ? '...' : t.saveChanges || 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="settings-v2-container">
        {/* Profile Information Section */}
        <section className="settings-card-v2">
          <div className="settings-card-header-v2">
            <h2>Profile Information</h2>
            <p>Update your photo and personal details.</p>
          </div>
          <div className="settings-card-body-v2">
            <div className="profile-layout-v2">
              <div className="avatar-section-v2">
                <div className="avatar-circle-v2" style={{ background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
                  {formData.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>

              <div className="profile-fields-grid-v2">
                <div className="field-group-v2">
                  <label className="field-label-v2">{t.firstName || 'First Name'}</label>
                  <input
                    type="text"
                    className="filter-control"
                    value={formData.firstName}
                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  />
                </div>
                <div className="field-group-v2">
                  <label className="field-label-v2">{t.lastName || 'Last Name'}</label>
                  <input
                    type="text"
                    className="filter-control"
                    value={formData.lastName}
                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  />
                </div>
                <div className="field-group-v2 full-width">
                  <label className="field-label-v2">Display Name</label>
                  <input
                    type="text"
                    className="filter-control"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                  />
                </div>
                <div className="field-group-v2 full-width">
                  <label className="field-label-v2">{t.emailAddress}</label>
                  <div className="input-with-icon-v2">
                    <MIcon name="mail" />
                    <input
                      type="email"
                      className="filter-control"
                      style={{ width: '100%' }}
                      disabled
                      value={formData.email}
                    />
                  </div>
                </div>
                <div className="field-group-v2 full-width">
                  <label className="field-label-v2">Bio</label>
                  <textarea
                    className="filter-control textarea-v2"
                    value={formData.bio}
                    onChange={(e) => handleFieldChange('bio', e.target.value)}
                    maxLength={150}
                  />
                  <span className="char-count-v2">{formData.bio.length}/150</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Security Section */}
        <section className="settings-card-v2">
          <div className="settings-card-header-v2">
            <h2>Account Security</h2>
            <p>Manage your security settings.</p>
          </div>
          <div className="settings-card-body-v2">
            <div className="security-item-v2">
              <div className="security-info-v2">
                <span className="security-title-v2">
                  Two-Factor Authentication
                  {formData.is2FA && <span className="badge-v2 badge-success-v2">Enabled</span>}
                </span>
                <span className="security-desc-v2">Add an extra layer of security to your account.</span>
              </div>
              <label className="switch-v2">
                <input
                  type="checkbox"
                  checked={formData.is2FA}
                  onChange={(e) => handleFieldChange('is2FA', e.target.checked)}
                />
                <span className="slider-v2"></span>
              </label>
            </div>
          </div>
        </section>

        {/* System Preferences Section */}
        <section className="settings-card-v2">
          <div className="settings-card-header-v2">
            <h2>System Preferences</h2>
            <p>Configure regional, language, and theme settings.</p>
          </div>
          <div className="settings-card-body-v2">
            <div className="profile-fields-grid-v2">
              <div className="field-group-v2">
                <label className="field-label-v2">{t.language}</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="filter-control">
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
              <div className="field-group-v2">
                <label className="field-label-v2">{t.darkMode}</label>
                <button className="btn btn-secondary" style={{ height: '42px' }} onClick={toggleTheme}>
                  {theme === 'dark' ? `🌙 ${t.on}` : `☀️ ${t.off}`}
                </button>
              </div>
              <div className="field-group-v2">
                <label className="field-label-v2">{t.defaultCurrency}</label>
                <select value={currency} onChange={(e) => onCurrencyChange(e.target.value)} className="filter-control">
                  {CURRENCIES.map((curr) => <option key={curr.code} value={curr.code}>{curr.symbol} {curr.code}</option>)}
                </select>
              </div>
              <div className="field-group-v2">
                <label className="field-label-v2">Data Backup</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleExport} className="btn btn-secondary" style={{ flex: 1 }} disabled={isProcessing}>
                    <MIcon name="download" size={16} /> Export
                  </button>
                  <div style={{ flex: 1 }}>
                    <input type="file" id="backup-file" accept=".json" onChange={handleImport} disabled={isProcessing} className="hidden-input" />
                    <label htmlFor="backup-file" className={`btn btn-secondary ${isProcessing ? 'disabled' : ''}`} style={{ width: '100%', cursor: 'pointer' }}>
                      <MIcon name="upload" size={16} /> Import
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

