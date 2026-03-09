import { useState, useMemo } from 'react';
import { Product, IncomeEntry } from '../types';
import ProductForm from './ProductForm';
import IncomeEntryForm from './IncomeEntryForm';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/currency';

/* ── Icons ── */
const MIcon = ({ name, size = 18 }: { name: string; size?: number }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }}>{name}</span>
);

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface SalesPageProps {
  products: Product[];
  incomeEntries: IncomeEntry[];
  onAddProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  onAddIncome: (entryData: Omit<IncomeEntry, 'id'>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  currency: string;
}

export default function SalesPage({
  products,
  onAddProduct,
  onAddIncome,
  onDeleteProduct,
  currency,
}: SalesPageProps) {
  const { t } = useLanguage();

  /* ── Local State ── */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryFilter, setCategoryFilter] = useState('All Items');
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  /* ── Derived Data ── */
  const categories = useMemo(() => {
    const cats = ['All Items', ...new Set(products.map(p => p.category).filter(Boolean))];
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'All Items') return products;
    return products.filter(p => p.category === categoryFilter);
  }, [products, categoryFilter]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = 0; // Fixed for now per mockup
  const total = subtotal + tax;

  /* ── Handlers ── */
  const updateQuantity = (product: Product, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(i => i.productId !== product.id);
        return prev.map(i => i.productId === product.id ? { ...i, quantity: newQty } : i);
      }
      if (delta > 0) {
        return [...prev, {
          id: crypto.randomUUID(),
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        }];
      }
      return prev;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;

    // Process each cart item as an income entry
    const entries = cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      amount: item.price * item.quantity,
      date: saleDate,
      notes: notes.trim() ? notes : undefined
    }));

    for (const entry of entries) {
      await onAddIncome(entry);
    }

    setCart([]);
    setNotes('');
    alert('Sale completed successfully!');
  };

  const getStockStatus = (stock: number | undefined) => {
    if (stock === undefined) return { label: 'In Stock', class: 'status-high' };
    if (stock <= 0) return { label: 'Out', class: 'status-low' };
    if (stock < 10) return { label: 'Low', class: 'status-medium' };
    return { label: 'High', class: 'status-high' };
  };

  return (
    <div className="sales-page-v2">
      <div className="page-header">
        <h1>{t.sales}</h1>
        <div className="sales-actions">
          <button onClick={() => setIsFormOpen(true)} className="btn btn-primary btn-add">
            <MIcon name="add" /> {t.addProduct}
          </button>
          <button onClick={() => setShowIncomeModal(true)} className="btn btn-secondary btn-add" style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border)' }}>
            <MIcon name="payments" /> {t.recordIncome}
          </button>
        </div>
      </div>

      <div className="sales-v2-container">
        {/* Left Column: Product Selection */}
        <div className="sales-v2-main">
          <div className="sales-v2-filters">
            <div className="filter-group">
              <label>Date</label>
              <input
                type="date"
                className="filter-control"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Category</label>
              <select
                className="filter-control"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="product-table-header-v2">
            <span>Product</span>
            <span style={{ textAlign: 'center' }}>Price</span>
            <span style={{ textAlign: 'center' }}>Stock</span>
            <span style={{ textAlign: 'center' }}>Quantity</span>
          </div>

          <div className="product-list-v2">
            {filteredProducts.length === 0 ? (
              <div className="income-form-empty">
                <MIcon name="inventory_2" size={48} />
                <p style={{ marginTop: 'var(--spacing-md)' }}>{t.noProductsAvailable}</p>
              </div>
            ) : filteredProducts.map(product => {
              const cartItem = cart.find(i => i.productId === product.id);
              const status = getStockStatus(product.inventory);
              return (
                <div key={product.id} className="product-row-v2">
                  <div className="product-cell-main">
                    <div className="product-icon-v2"><MIcon name="package_2" size={24} /></div>
                    <div className="product-info-text">
                      <span className="product-name-v2">{product.name}</span>
                      <span className="product-meta-v2">{product.category || 'General'}</span>
                    </div>
                  </div>

                  <div className="product-price-v2" style={{ textAlign: 'center' }}>
                    {formatCurrency(product.price, currency)}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span className={`stock-status-v2 ${status.class}`}>{status.label}</span>
                  </div>

                  <div className="qty-control-v2">
                    <button className="qty-btn" onClick={() => updateQuantity(product, -1)} disabled={!cartItem}>
                      <MIcon name="remove" size={14} />
                    </button>
                    <span className="qty-val">{cartItem?.quantity || 0}</span>
                    <button className="qty-btn plus" onClick={() => updateQuantity(product, 1)}>
                      <MIcon name="add" size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Current Sale / Cart */}
        <aside className="current-sale-pane">
          <h2 className="cart-title-v2">Current Sale</h2>

          <div className="notes-area-v2">
            <label>Notes (Optional)</label>
            <textarea
              className="notes-input-v2"
              placeholder="Add notes for this sale..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="cart-items-list-v2">
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: 'var(--text-muted)' }}>
                <MIcon name="shopping_cart" size={40} />
                <p style={{ fontSize: 'var(--font-sm)', marginTop: 'var(--spacing-sm)' }}>No items added yet</p>
              </div>
            ) : cart.map(item => (
              <div key={item.productId} className="cart-item-v2">
                <div className="product-icon-v2" style={{ width: 36, height: 36, borderRadius: 8 }}>
                  <MIcon name="inventory" size={18} />
                </div>
                <div className="cart-item-info">
                  <span className="cart-item-name">{item.name}</span>
                  <span className="cart-item-sub">{item.quantity} × {formatCurrency(item.price, currency)}</span>
                </div>
                <div className="cart-item-price-side">
                  <span className="side-item-price">{formatCurrency(item.price * item.quantity, currency)}</span>
                  <button className="remove-btn-v2" onClick={() => removeFromCart(item.productId)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary-v2">
            <div className="summary-row-v2">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="summary-row-v2">
              <span>Tax (0%)</span>
              <span>{formatCurrency(tax, currency)}</span>
            </div>
            <div className="summary-row-v2 total">
              <span>Total</span>
              <span className="total-val">{formatCurrency(total, currency)}</span>
            </div>
          </div>

          <button
            className={`btn btn-primary ${cart.length === 0 ? 'disabled' : ''}`}
            style={{ width: '100%', padding: 'var(--spacing-md)', fontSize: 'var(--font-base)', borderRadius: 'var(--radius-lg)' }}
            disabled={cart.length === 0}
            onClick={handleCompleteSale}
          >
            Complete Sale <MIcon name="arrow_forward" size={18} />
          </button>
        </aside>
      </div>

      {/* Product Modal */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t.addNewProduct}</h2>
              <button className="modal-close" onClick={() => setIsFormOpen(false)} title={t.close}>×</button>
            </div>
            <div className="modal-body">
              <ProductForm
                onSubmit={async (data) => { await onAddProduct(data); setIsFormOpen(false); }}
                onCancel={() => setIsFormOpen(false)}
                currency={currency}
                hideCancel={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Legacy Income Modal */}
      {showIncomeModal && (
        <div className="modal-overlay" onClick={() => setShowIncomeModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t.recordIncome}</h2>
              <button className="modal-close" onClick={() => setShowIncomeModal(false)} title={t.close}>×</button>
            </div>
            <div className="modal-body">
              <IncomeEntryForm
                products={products}
                onSubmit={async (data) => { await onAddIncome(data); }}
                onCancel={() => setShowIncomeModal(false)}
                currency={currency}
                onDeleteProduct={onDeleteProduct}
                showTitle={false}
                formId="sales-modal-form"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

