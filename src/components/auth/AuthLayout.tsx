import { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="auth-container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--bg)',
            padding: 'var(--spacing-md)'
        }}>
            <div className="auth-card" style={{
                background: 'var(--bg-card)',
                padding: 'var(--spacing-2xl)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                width: '100%',
                maxWidth: '400px',
                boxShadow: 'var(--shadow)'
            }}>
                <div className="auth-header" style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <div className="logo-circle" style={{
                        width: '48px',
                        height: '48px',
                        background: 'var(--accent)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--spacing-md)',
                        color: 'white'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>account_balance_wallet</span>
                    </div>
                    <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', margin: '0 0 8px', color: 'var(--text)' }}>
                        {title}
                    </h1>
                    {subtitle && (
                        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', margin: 0 }}>
                            {subtitle}
                        </p>
                    )}
                </div>
                {children}
            </div>
        </div>
    );
}
