import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import { useLanguage } from '../../context/LanguageContext';

interface LoginPageProps {
    onSwitchMode: () => void;
}

export default function LoginPage({ onSwitchMode }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();
    const { t } = useLanguage();
    // We can add "Don't have an account?" link logic later or manage routing here if we have a router.
    // For now, assuming App.tsx handles conditional rendering or we can emit an event.
    // Actually, since we don't have a full router (React Router), we probably need a way 
    // to switch between Login and Register in the parent or a simple state.
    // Let's assume for now we might expose a prop or use a global state for "Auth View".
    // But standard way is routing.
    // Given the current architecture (single page app with "views"), 
    // we might need to add 'login' and 'register' to the `currentView` in App.tsx or handle it inside `AuthLayout`.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!email || !password) {
            setError(t.fillAllFields);
            return;
        }

        const success = await login(email);
        if (!success) {
            setError(t.invalidCredentials);
        }
    };

    return (
        <AuthLayout title={t.welcomeBack} subtitle={t.loginSubtitle}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                {error && (
                    <div className="error-message" style={{
                        color: 'var(--error)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        padding: 'var(--spacing-sm)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-sm)',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>{t.emailAddress}</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="filter-control"
                        style={{ width: '100%', padding: '10px' }}
                        placeholder="name@example.com"
                    />
                </div>

                <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>{t.password}</label>
                        <a href="#" style={{ fontSize: 'var(--font-xs)', color: 'var(--accent)', textDecoration: 'none' }}>Forgot password?</a>
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="filter-control"
                        style={{ width: '100%', padding: '10px' }}
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                    style={{ width: '100%', justifyContent: 'center', height: '44px', fontSize: 'var(--font-base)' }}
                >
                    {isLoading ? t.signingIn : t.signIn}
                </button>

                <p style={{ textAlign: 'center', fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginTop: 'var(--spacing-md)' }}>
                    {t.dontHaveAccount} <button type="button" onClick={onSwitchMode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>{t.createAccount}</button>
                </p>
            </form>
        </AuthLayout>
    );
}
