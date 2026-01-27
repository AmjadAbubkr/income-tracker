import type { ReactNode } from 'react';

interface SummaryCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    trend?: string;
    className?: string; // e.g. 'revenue-card', 'expenses-card', 'profit-card'
}

export default function SummaryCard({ title, value, icon, trend, className }: SummaryCardProps) {
    return (
        <div className={`analytics-card ${className || ''}`}>
            <h3>{title}</h3>
            <p className="analytics-value">{value}</p>
            {trend && (
                <p className="analytics-trend">
                    {trend}
                </p>
            )}
            <div className="card-icon">{icon}</div>
        </div>
    );
}
