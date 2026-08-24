import { useState, useMemo, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { IncomeEntry, Product } from '../types';
import { useProducts } from '../hooks/useProducts';
import { useIncomeStore } from '../stores/incomeStore';
import ProductForm from './ProductForm';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/currency';
import { useNotifications } from '../context/NotificationContext';

/* ── Icons ── */
const MIcon = ({ name, size = 18 }: { name: string; size?: number }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }} aria-hidden="true">{name}</span>
);

interface CartItem {
  id: string;
  productId: string;
  name: string;
  priceMinor: number;
  quantity: number;
}

interface SalesPageProps {
  currency: string;
}

const ALL_ITEMS = '__all_items__';

export default function SalesPage({ currency }: SalesPageProps) {
  const { t } = useLanguage();

  /**
   * Fetch products directly via React Query instead of accepting them as a prop
   * from App.tsx's stale local state.
   */
  const { data: products = [] } = useProducts();
  const incomeStore = useIncomeStore();
  const queryClient = useQueryClient();
  const { refreshNotifications } = useNotifications();

  /* ── Local State ── */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryFilter, setCategoryFilter] = useState(ALL_ITEMS);
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyDate, setHistoryDate] = useState('');
  const [historyProductId, setHistoryProductId] = useState('');
  const [editingSale, setEditingSale] = useState<IncomeEntry | null>(null);

  /* ── Derived ── */
  const categories = useMemo(() => {
    const cats = new Set<string>([ALL_ITEMS]);
    products.forEach((p) => p.category && cats.add(p.category));
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (categoryFilter === ALL_ITEMS) return products;
    return products.filter((p) => p.category === categoryFilter);
  }, [products, categoryFilter]);

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.productId === product.id);
    if (existing) {
      setCart(cart.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { id: crypto.randomUUID(), productId: product.id, name: product.name, priceMinor: product.priceMinor, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      cart
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotalMinor = cart.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0);

  const filteredHistory = useMemo(() => {
    return [...incomeStore.entries]
      .filter((entry) => !historyDate || entry.date === historyDate)
      .filter((entry) => !historyProductId || entry.productId === historyProductId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [historyDate, historyProductId, incomeStore.entries]);

  const handleCompleteSale = async () => {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await incomeStore.checkout(
        cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        saleDate,
        notes,
      );
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await refreshNotifications();
      setCart([]);
      setNotes('');
      setShowIncomeModal(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : t.failedToCompleteSale);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSale = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingSale) return;

    const formData = new FormData(event.currentTarget);
    const productId = String(formData.get('productId') || '');
    const quantity = Number(formData.get('quantity'));
    const date = String(formData.get('date') || '');
    const notesValue = String(formData.get('notes') || '').trim();
    const product = products.find((item) => item.id === productId);

    if (!product || !Number.isSafeInteger(quantity) || quantity <= 0 || !date) {
      alert(t.fillRequiredFields);
      return;
    }

    try {
      await incomeStore.update(editingSale.id, {
        productId,
        quantity,
        amountMinor: product.priceMinor * quantity,
        date,
        notes: notesValue || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await refreshNotifications();
      setEditingSale(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : t.failedToUpdateSale);
    }
  };

  const handleDeleteSale = async (entry: IncomeEntry) => {
    if (!window.confirm(t.confirmDeleteEntry)) return;
    try {
      await incomeStore.remove(entry.id);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await refreshNotifications();
    } catch (error) {
      alert(error instanceof Error ? error.message : t.failedToDeleteSale);
    }
  };

  return (
    <div className="sales-page">
      <div className="page-header">
        <h1>{t.sales}</h1>
        <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
          <MIcon name="add" /> {t.addProduct}
        </button>
      </div>

      {/* Category filter */}
      <div className="category-filter">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn${categoryFilter === cat ? ' active' : ''}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat === ALL_ITEMS ? t.allItems : cat}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="products-grid">
        {filteredProducts.map((product) => (
          <button type="button" key={product.id} className="product-card" onClick={() => addToCart(product)} aria-label={`${t.addToCart}: ${product.name}`}>
            <h3>{product.name}</h3>
            <p className="price">{formatCurrency(product.priceMinor, currency)}</p>
            {product.inventory !== undefined && (
              <p className="stock">{t.stockLabel.replace('{stock}', String(product.inventory))}</p>
            )}
          </button>
        ))}
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="cart">
          <h3>{t.cart}</h3>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <span>{item.name}</span>
              <button type="button" onClick={() => updateQuantity(item.id, -1)} aria-label={t.decreaseQuantity}>-</button>
              <span>{item.quantity}</span>
              <button type="button" onClick={() => updateQuantity(item.id, 1)} aria-label={t.increaseQuantity}>+</button>
              <span>{formatCurrency(item.priceMinor * item.quantity, currency)}</span>
              <button type="button" onClick={() => removeFromCart(item.id)}>{t.remove}</button>
            </div>
          ))}
          <div className="cart-total">
            <strong>{t.total}: {formatCurrency(cartTotalMinor, currency)}</strong>
          </div>
          <button type="button" onClick={() => setShowIncomeModal(true)}>{t.completeSale}</button>
        </div>
      )}

      {/* Modals */}
      {isFormOpen && (
        <ProductForm
          mode="add"
          currency={currency}
          onSuccess={() => setIsFormOpen(false)}
        />
      )}
      {showIncomeModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t.completeSale} tabIndex={-1} style={{ overscrollBehavior: 'contain' }} onClick={() => setShowIncomeModal(false)} onKeyDown={(e) => { if (e.key === 'Escape') setShowIncomeModal(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t.completeSale}</h2>
              <button type="button" className="modal-close" onClick={() => setShowIncomeModal(false)} aria-label={t.close} title={t.close}>×</button>
            </div>
            <div className="form-actions" style={{ padding: '1rem' }}>
              <button type="button" className="btn btn-primary" onClick={handleCompleteSale} disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><span className="btn-spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} aria-hidden="true" /> {t.confirm}</span> : t.confirm}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowIncomeModal(false)}>
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="sales-history" aria-labelledby="sales-history-title">
        <div className="page-header">
          <h2 id="sales-history-title">{t.salesHistory}</h2>
        </div>
        <div className="history-filters">
          <label>
            {t.date}
            <input
              type="date"
              value={historyDate}
              onChange={(event) => setHistoryDate(event.target.value)}
            />
          </label>
          <label>
            {t.product}
            <select value={historyProductId} onChange={(event) => setHistoryProductId(event.target.value)}>
              <option value="">{t.allProducts}</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
          </label>
        </div>

        {filteredHistory.length === 0 ? (
          <p className="empty-state-card">{t.noSalesHistory}</p>
        ) : (
          <div className="history-list">
            {filteredHistory.map((entry) => {
              const product = products.find((item) => item.id === entry.productId);
              return (
                <div key={entry.id} className="history-item">
                  <div>
                    <strong>{product?.name || t.unknown}</strong>
                    <span>{entry.date} · {t.quantity}: {entry.quantity}</span>
                    {entry.notes && <span>{entry.notes}</span>}
                  </div>
                  <div className="history-actions">
                    <strong>{formatCurrency(entry.amountMinor, currency)}</strong>
                    {product && (
                      <>
                        <button type="button" onClick={() => setEditingSale(entry)}>{t.edit}</button>
                        <button type="button" onClick={() => handleDeleteSale(entry)}>{t.delete}</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {editingSale && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-sale-title" tabIndex={-1} style={{ overscrollBehavior: 'contain' }} onClick={() => setEditingSale(null)} onKeyDown={(e) => { if (e.key === 'Escape') setEditingSale(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 id="edit-sale-title">{t.editSale}</h2>
              <button type="button" className="modal-close" onClick={() => setEditingSale(null)} aria-label={t.close} title={t.close}>×</button>
            </div>
            <form className="modal-body" onSubmit={handleUpdateSale}>
              <label className="form-group">
                {t.product}
                <select name="productId" defaultValue={editingSale.productId} required>
                  {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                </select>
              </label>
              <label className="form-group">
                {t.quantity}
                <input name="quantity" type="number" min="1" step="1" defaultValue={editingSale.quantity} required />
              </label>
              <label className="form-group">
                {t.date}
                <input name="date" type="date" defaultValue={editingSale.date} required />
              </label>
              <label className="form-group">
                {t.notes}
                <textarea name="notes" defaultValue={editingSale.notes || ''} />
              </label>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{t.saveChanges}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingSale(null)}>{t.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
