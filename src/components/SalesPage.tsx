import { useState, useMemo } from 'react';
import { Product, IncomeEntry } from '../types';
import { useProducts } from '../hooks/useProducts';
import { useIncomeStore } from '../stores/incomeStore';
import ProductForm from './ProductForm';
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
  currency: string;
}

export default function SalesPage({ currency }: SalesPageProps) {
  const { t } = useLanguage();

  /**
   * Fetch products directly via React Query instead of accepting them as a prop
   * from App.tsx's stale local state.
   */
  const { data: products = [] } = useProducts();
  const incomeStore = useIncomeStore();

  /* ── Local State ── */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryFilter, setCategoryFilter] = useState('All Items');
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  /* ── Derived ── */
  const categories = useMemo(() => {
    const cats = new Set<string>(['All Items']);
    products.forEach((p) => p.category && cats.add(p.category));
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'All Items') return products;
    return products.filter((p) => p.category === categoryFilter);
  }, [products, categoryFilter]);

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.productId === product.id);
    if (existing) {
      setCart(cart.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { id: crypto.randomUUID(), productId: product.id, name: product.name, price: product.price, quantity: 1 }]);
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

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCompleteSale = async () => {
    for (const item of cart) {
      await incomeStore.add({
        productId: item.productId,
        quantity: item.quantity,
        amount: item.price * item.quantity,
        date: saleDate,
        notes: notes || undefined,
      } as Omit<IncomeEntry, 'id'>);
    }
    setCart([]);
    setNotes('');
    setShowIncomeModal(false);
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
            {cat}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
            <h3>{product.name}</h3>
            <p className="price">{formatCurrency(product.price, currency)}</p>
            {product.inventory !== undefined && (
              <p className="stock">Stock: {product.inventory}</p>
            )}
          </div>
        ))}
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="cart">
          <h3>Cart</h3>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <span>{item.name}</span>
              <button onClick={() => updateQuantity(item.id, -1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, 1)}>+</button>
              <span>{formatCurrency(item.price * item.quantity, currency)}</span>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))}
          <div className="cart-total">
            <strong>Total: {formatCurrency(cartTotal, currency)}</strong>
          </div>
          <button onClick={() => setShowIncomeModal(true)}>Complete Sale</button>
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
        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={handleCompleteSale}>
            {t.confirm}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowIncomeModal(false)}>
            {t.cancel}
          </button>
        </div>
      )}
    </div>
  );
}
