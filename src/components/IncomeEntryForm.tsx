import { useState } from 'react';
import { Product, IncomeEntry } from '../types';
import { formatCurrency } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';

/* ── Inline Material Symbol helper ── */
const MIcon = ({ name, size = 18 }: { name: string; size?: number }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }}>{name}</span>
);

interface IncomeEntryFormProps {
  products: Product[];
  onSubmit: (entry: Omit<IncomeEntry, 'id'>) => void | Promise<void>;
  onCancel?: () => void;
  currency: string;
  onDeleteProduct?: (id: string) => void | Promise<void>;
  showTitle?: boolean;
  formId?: string; // Unique ID prefix for form elements
}

export default function IncomeEntryForm({
  products,
  onSubmit,
  onCancel,
  currency,
  onDeleteProduct,
  showTitle = true,
  formId = 'income-form',
}: IncomeEntryFormProps) {
  const { t } = useLanguage();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 0;
      const newValue = Math.max(0, current + delta);
      if (newValue === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newValue };
    });
  };

  const handleConfirm = async (productId: string) => {
    const quantity = quantities[productId] ?? 0;
    if (quantity <= 0) {
      alert(t.setQuantityGreaterThanZero);
      return;
    }

    if (!date) {
      alert(t.selectDate);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (product.inventory !== undefined && product.inventory < quantity) {
      alert(t.insufficientStock.replace('{stock}', product.inventory.toString()));
      return;
    }

    try {
      await onSubmit({
        productId,
        quantity,
        amount: product.price * quantity,
        date,
        notes: notes.trim() || undefined,
      });

      setQuantities((prev) => {
        const { [productId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Error recording income:', error);
    }
  };

  const getStockStatus = (stock: number | undefined) => {
    if (stock === undefined) return { label: 'In Stock', class: 'status-high' };
    if (stock <= 0) return { label: 'Out', class: 'status-low' };
    if (stock < 10) return { label: 'Low', class: 'status-medium' };
    return { label: 'High', class: 'status-high' };
  };

  return (
    <div className="income-form-v2">
      {showTitle && <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>{t.recordIncome}</h2>}

      <div className="income-form-meta">
        <div className="filter-group">
          <label htmlFor={`${formId}-date`}>{t.date}</label>
          <input
            id={`${formId}-date`}
            type="date"
            className="filter-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="filter-group">
          <label htmlFor={`${formId}-notes`}>{t.notesOptional}</label>
          <input
            id={`${formId}-notes`}
            className="filter-control"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.optionalNotesPlaceholder}
          />
        </div>
      </div>

      <div className="income-form-products">
        {products.map((product) => {
          const qty = quantities[product.id] ?? 0;
          const status = getStockStatus(product.inventory);

          return (
            <div key={product.id} className="product-row-v2" style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
              <div className="product-cell-main">
                <div className="product-icon-v2" style={{ width: 40, height: 40 }}>
                  <MIcon name="inventory_2" size={20} />
                </div>
                <div className="product-info-text">
                  <span className="product-name-v2">{product.name}</span>
                  <span className="product-meta-v2">{formatCurrency(product.price, currency)} • <span className={status.class} style={{ background: 'transparent', padding: 0 }}>{status.label}</span></span>
                </div>
              </div>

              <div className="qty-control-v2">
                <button className="qty-btn" onClick={() => handleQuantityChange(product.id, -1)} disabled={qty === 0}>
                  <MIcon name="remove" size={14} />
                </button>
                <span className="qty-val">{qty}</span>
                <button className="qty-btn plus" onClick={() => handleQuantityChange(product.id, 1)}>
                  <MIcon name="add" size={14} />
                </button>
              </div>

              <button
                className={`btn btn-primary ${qty === 0 ? 'disabled' : ''}`}
                style={{ padding: '8px 16px', fontSize: 'var(--font-xs)' }}
                onClick={() => handleConfirm(product.id)}
                disabled={qty === 0}
              >
                {t.confirm}
              </button>

              {onDeleteProduct && (
                <button
                  type="button"
                  className="btn-delete-product"
                  style={{ opacity: 0.5 }}
                  onClick={() => confirm(t.confirmDeleteProduct) && onDeleteProduct(product.id)}
                >
                  <MIcon name="delete" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {onCancel && (
        <div className="form-actions" style={{ marginTop: 'var(--spacing-xl)', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            {t.cancel}
          </button>
        </div>
      )}
    </div>
  );
}

