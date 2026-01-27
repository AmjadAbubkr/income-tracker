import { useState } from 'react';
import { Product, IncomeEntry } from '../types';
import { formatCurrency } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';

// Professional SVG icons
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
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

  const handleQuantityInputChange = (productId: string, value: string) => {
    if (value === '') {
      setQuantities((prev) => {
        const { [productId]: _, ...rest } = prev;
        return rest;
      });
      return;
    }

    const parsedValue = Number(value);
    if (Number.isNaN(parsedValue)) {
      return;
    }

    const sanitizedValue = Math.max(0, Math.floor(parsedValue));
    setQuantities((prev) => {
      if (sanitizedValue === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: sanitizedValue };
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

    // Check inventory if it's tracked
    if (product.inventory !== undefined && product.inventory < quantity) {
      alert(t.insufficientStock.replace('{stock}', product.inventory.toString()));
      return;
    }

    const amount = product.price * quantity;

    try {
      await onSubmit({
        productId,
        quantity,
        amount,
        date,
        notes: notes.trim() || undefined,
      });

      // Reset quantity for this product only after successful submission
      setQuantities((prev) => {
        const { [productId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Error submitting income entry:', error);
      alert(t.failedToRecordIncome || 'Failed to record income. Please try again.');
    }
  };

  if (products.length === 0) {
    return (
      <div className="income-form-empty">
        <p>{t.noProductsAvailableAddFirst}</p>
      </div>
    );
  }

  return (
    <div className="income-form">
      {showTitle && <h2>{t.recordIncome}</h2>}

      <div className="form-group">
        <label htmlFor={`${formId}-date`}>{t.date} *</label>
        <input
          id={`${formId}-date`}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor={`${formId}-notes`}>{t.notesOptional}</label>
        <textarea
          id={`${formId}-notes`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.optionalNotesPlaceholder}
          rows={2}
        />
      </div>

      <div className="products-grid">
        {products.map((product) => {
          const quantity = quantities[product.id] ?? 0;
          const totalAmount = product.price * quantity;

          return (
            <div key={product.id} className="product-box">
              {product.image && (
                <div className="product-box-image-container">
                  <img src={product.image} alt={product.name} className="product-box-image" />
                </div>
              )}
              <div className="product-box-header">
                <h3>{product.name}</h3>
                <div className="product-box-header-right">
                  <div className="product-price">{formatCurrency(product.price, currency)}</div>
                  {onDeleteProduct && (
                    <button
                      type="button"
                      className="btn-delete-product"
                      onClick={() => {
                        if (confirm(t.confirmDeleteProduct)) {
                          onDeleteProduct(product.id);
                        }
                      }}
                      title={t.deleteProduct}
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>
              {product.description && (
                <p className="product-description">{product.description}</p>
              )}

              {product.inventory !== undefined && (
                <div className="inventory-info">
                  <span className="inventory-label">{t.stock}:</span>
                  <span className={`inventory-value ${product.inventory <= 5 ? 'low-stock' : ''} ${product.inventory === 0 ? 'out-of-stock' : ''}`}>
                    {product.inventory}
                  </span>
                </div>
              )}

              <div className="quantity-controls">
                <button
                  type="button"
                  className="btn-quantity btn-minus"
                  onClick={() => handleQuantityChange(product.id, -1)}
                  disabled={quantity === 0}
                >
                  <span className="icon-minus"><MinusIcon /></span>
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={0}
                  step={1}
                  className="quantity-input"
                  value={quantity === 0 ? '' : quantity}
                  onChange={(e) => handleQuantityInputChange(product.id, e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      handleQuantityInputChange(product.id, '0');
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-quantity btn-plus"
                  onClick={() => handleQuantityChange(product.id, 1)}
                >
                  <span className="icon-plus"><PlusIcon /></span>
                </button>
              </div>

              {quantity > 0 && (
                <div className="product-total">
                  {t.total}: <strong>{formatCurrency(totalAmount, currency)}</strong>
                </div>
              )}

              <button
                type="button"
                className="btn-confirm"
                onClick={() => handleConfirm(product.id)}
                disabled={quantity === 0}
              >
                <span className="icon-confirm"><CheckIcon /></span>
                {t.confirm}
              </button>
            </div>
          );
        })}
      </div>

      {onCancel && (
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            {t.cancel}
          </button>
        </div>
      )}
    </div>
  );
}

