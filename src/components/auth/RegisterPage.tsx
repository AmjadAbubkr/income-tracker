import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import { useLanguage } from '../../context/LanguageContext';

interface RegisterPageProps {
    onSwitchMode: () => void;
}

export default function RegisterPage({ onSwitchMode }: RegisterPageProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register, isLoading } = useAuth();
    const { t } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!name || !email || !password || !confirmPassword) {
            setError(t.fillAllFields);
            return;
        }

        if (password !== confirmPassword) {
            setError(t.passwordsDoNotMatch);
            return;
        }

        if (password.length < 6) {
            setError(t.passwordTooShort);
            return;
        }

        const success = await register({ name, email, password });
        if (!success) {
            setError(t.registrationFailed);
        }
    };

    return (
        <AuthLayout title={t.registerTitle} subtitle={t.registerSubtitle}>
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
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>{t.fullName}</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="filter-control"
                        style={{ width: '100%', padding: '10px' }}
                        placeholder="John Doe"
                    />
                </div>

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
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>{t.password}</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="filter-control"
                        style={{ width: '100%', padding: '10px' }}
                        placeholder="••••••••"
                    />
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>{t.confirmPassword}</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                    {isLoading ? t.creatingAccount : t.createAccount}
                </button>

                <p style={{ textAlign: 'center', fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginTop: 'var(--spacing-md)' }}>
                    {t.alreadyHaveAccount} <button type="button" onClick={onSwitchMode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>{t.signIn}</button>
                </p>
            </form>
        </AuthLayout>
    );
}
