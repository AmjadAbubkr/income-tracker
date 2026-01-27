import { storage } from './storage';
import { Product, IncomeEntry, Expense } from '../types';

interface BackupData {
    version: number;
    timestamp: string;
    data: {
        products: Product[];
        incomeEntries: IncomeEntry[];
        expenses: Expense[];
    };
}

export const backupService = {
    async exportData(): Promise<void> {
        try {
            const [products, incomeEntries, expenses] = await Promise.all([
                storage.getProducts(),
                storage.getIncomeEntries(),
                storage.getExpenses(),
            ]);

            const backup: BackupData = {
                version: 1,
                timestamp: new Date().toISOString(),
                data: {
                    products,
                    incomeEntries,
                    expenses,
                },
            };

            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `income-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            throw new Error('Failed to export data');
        }
    },

    async importData(file: File): Promise<void> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (event) => {
                try {
                    const content = event.target?.result as string;
                    const backup: BackupData = JSON.parse(content);

                    // Basic validation
                    if (!backup.data || !Array.isArray(backup.data.products) || !Array.isArray(backup.data.incomeEntries)) {
                        throw new Error('Invalid backup file format');
                    }

                    // Clear existing data and restore backup
                    // We save sequentially to avoid race conditions with DB connections if any
                    await storage.saveProducts(backup.data.products);
                    await storage.saveIncomeEntries(backup.data.incomeEntries);

                    if (backup.data.expenses) {
                        await storage.saveExpenses(backup.data.expenses);
                    } else {
                        await storage.saveExpenses([]);
                    }

                    resolve();
                } catch (error) {
                    console.error('Import failed:', error);
                    reject(new Error('Failed to import data. The file might be corrupted or invalid.'));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    },
};
