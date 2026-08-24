import { useState, useEffect } from 'react';
import { CURRENCIES } from '../utils/currency';
import { backupService } from '../utils/backup';
import { useTheme } from '../context/ThemeContext';
import { Language, useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import CategoryManager from './CategoryManager';

/* ── Inline Material Symbol helper ── */
const MIcon = ({ name, size = 20 }: { name: string; size?: number }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }} aria-hidden="true">{name}</span>
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

  const handleFieldChange = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsProcessing(true);
    const success = await updateProfile({
      name: formData.name,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      bio: formData.bio,
      is2FA: formData.is2FA
    });

    setIsProcessing(false);
    if (success) {
      alert(t.settingsSaved || 'Settings saved successfully!');
    } else {
      alert(t.failedToSaveSettings);
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
          <p className="page-subtitle">{t.settingsSubtitle}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={isProcessing} aria-busy={isProcessing} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MIcon name="save" size={18} /> {isProcessing ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} aria-hidden="true" /> Saving…</span> : (t.saveChanges || 'Save Changes')}
          </button>
        </div>
      </div>

      <div className="settings-v2-container">
        {/* Profile Information Section */}
        <section className="settings-card-v2">
          <div className="settings-card-header-v2">
            <h2>{t.profileInformation}</h2>
            <p>{t.profileInformationDescription}</p>
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
                  <label htmlFor="profile-first-name" className="field-label-v2">{t.firstName}</label>
                  <input
                    type="text"
                    id="profile-first-name"
                    name="firstName"
                    autoComplete="given-name"
                    className="filter-control"
                    value={formData.firstName}
                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  />
                </div>
                <div className="field-group-v2">
                  <label htmlFor="profile-last-name" className="field-label-v2">{t.lastName}</label>
                  <input
                    type="text"
                    id="profile-last-name"
                    name="lastName"
                    autoComplete="family-name"
                    className="filter-control"
                    value={formData.lastName}
                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  />
                </div>
                <div className="field-group-v2 full-width">
                  <label htmlFor="profile-display-name" className="field-label-v2">{t.displayName}</label>
                  <input
                    type="text"
                    id="profile-display-name"
                    name="displayName"
                    autoComplete="name"
                    className="filter-control"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                  />
                </div>
                <div className="field-group-v2 full-width">
                  <label htmlFor="profile-email" className="field-label-v2">{t.emailAddress}</label>
                  <div className="input-with-icon-v2">
                    <MIcon name="mail" />
                    <input
                      type="email"
                      id="profile-email"
                      name="email"
                      autoComplete="email"
                      spellCheck={false}
                      className="filter-control"
                      style={{ width: '100%' }}
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="field-group-v2 full-width">
                  <label htmlFor="profile-bio" className="field-label-v2">{t.bio}</label>
                  <textarea
                    id="profile-bio"
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
            <h2>{t.accountSecurity}</h2>
            <p>{t.accountSecurityDescription}</p>
          </div>
          <div className="settings-card-body-v2">
            <div className="security-item-v2">
              <div className="security-info-v2">
                <span className="security-title-v2">
                  {t.twoFactorAuthentication}
                  {formData.is2FA && <span className="badge-v2 badge-success-v2">{t.enabled}</span>}
                </span>
                <span className="security-desc-v2">{t.twoFactorDescription}</span>
              </div>
                <label htmlFor="two-factor-toggle" className="switch-v2">
                  <input
                    id="two-factor-toggle"
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
            <h2>{t.systemPreferences}</h2>
            <p>{t.systemPreferencesDescription}</p>
          </div>
          <div className="settings-card-body-v2">
            <div className="profile-fields-grid-v2">
              <div className="field-group-v2">
                <label htmlFor="settings-language" className="field-label-v2">{t.language}</label>
                <select id="settings-language" value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="filter-control">
                  <option value="en">{t.english}</option>
                  <option value="fr">{t.french}</option>
                  <option value="ar">{t.arabic}</option>
                </select>
              </div>
              <div className="field-group-v2">
                <label htmlFor="theme-toggle" className="field-label-v2">{t.darkMode}</label>
                <button id="theme-toggle" type="button" className="btn btn-secondary" style={{ height: '42px' }} onClick={toggleTheme}>
                  {theme === 'dark' ? `🌙 ${t.on}` : `☀️ ${t.off}`}
                </button>
              </div>
              <div className="field-group-v2">
                <label htmlFor="settings-currency" className="field-label-v2">{t.defaultCurrency}</label>
                <select id="settings-currency" value={currency} onChange={(e) => onCurrencyChange(e.target.value)} className="filter-control">
                  {CURRENCIES.map((curr) => <option key={curr.code} value={curr.code}>{curr.symbol} {curr.code}</option>)}
                </select>
              </div>
              <div className="field-group-v2">
                <span className="field-label-v2">{t.dataBackup}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={handleExport} className="btn btn-secondary" style={{ flex: 1 }} disabled={isProcessing} aria-label={t.exportData}>
                    <MIcon name="download" size={16} /> {t.exportData}
                  </button>
                  <div style={{ flex: 1 }}>
                    <input type="file" id="backup-file" accept=".json" onChange={handleImport} disabled={isProcessing} className="hidden-input" />
                    <label htmlFor="backup-file" className={`btn btn-secondary ${isProcessing ? 'disabled' : ''}`} style={{ width: '100%', cursor: 'pointer' }}>
                      <MIcon name="upload" size={16} /> {t.importData}
                    </label>
                  </div>
                </div>
              </div>
            </div>
      </div>
    </section>

    {/* Product Categories Section */}
    <section className="settings-card-v2">
      <div className="settings-card-header-v2">
        <h2>{t.productCategories}</h2>
        <p>{t.productCategoriesDescription}</p>
      </div>
      <div className="settings-card-body-v2">
        <CategoryManager />
      </div>
    </section>
      </div>
    </div>
  );
}
