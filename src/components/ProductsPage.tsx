import { useMemo, useState } from 'react';
import { Product } from '../types';
import { formatCurrency } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';
import { useProducts, useProductMutations } from '../hooks/useProducts';
import ProductForm from './ProductForm';
import { useNotifications } from '../context/NotificationContext';

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

interface ProductsPageProps {
  currency: string;
  searchQuery: string;
}

export default function ProductsPage({
  currency,
  searchQuery
}: ProductsPageProps) {
  const { t } = useLanguage();
  const { data: products = [], isLoading, error } = useProducts();
  const mutations = useProductMutations();
  const { refreshNotifications } = useNotifications();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(t.all);

  const categories = useMemo(() => {
    const cats = products.flatMap(p => p.category ? [p.category] : []);
    return [t.all, ...Array.from(new Set(cats))];
  }, [products, t.all]);

  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== t.all) {
      result = result.filter(p => p.category === selectedCategory);
    }

    return result;
  }, [products, searchQuery, selectedCategory, t.all]);

  const getStockStatus = (inventory: number | undefined) => {
    if (inventory === undefined) return { label: t.notTracked, class: 'status-neutral' };
    if (inventory === 0) return { label: t.outOfStock, class: 'status-error' };
    if (inventory <= 5) return { label: t.lowStock, class: 'status-warning' };
    return { label: t.inStock, class: 'status-success' };
  };

  const handleEditSubmit = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    if (editingProduct) {
      mutations.update.mutate({ id: editingProduct.id, data: productData }, {
        onSuccess: () => {
          setEditingProduct(null);
          void refreshNotifications();
        },
      });
    }
  };

  const handleAddSubmit = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    mutations.create.mutate(productData, {
      onSuccess: () => {
        setIsFormOpen(false);
        void refreshNotifications();
      },
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t.confirmDeleteProduct)) {
      mutations.delete.mutate(id, { onSuccess: () => void refreshNotifications() });
    }
  };

  if (isLoading) {
    return (
      <div className="products-page">
        <div className="page-header">
          <h1>{t.inventory}</h1>
        </div>
        <div className="empty-state-card">
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="page-header">
          <h1>{t.inventory}</h1>
        </div>
        <div className="empty-state-card">
          <p style={{ color: 'var(--error)' }}>
            {t.errorLoadingProducts}: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>{t.inventory}</h1>
        <button type="button" onClick={() => setIsFormOpen(true)} className="btn btn-primary">
          + {t.addProduct}
        </button>
      </div>

      <div className="products-controls" style={{ marginBottom: '1rem' }}>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="settings-select"
          style={{ width: '200px' }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state-card">
          <p>{searchQuery ? t.noProductsFound : t.noProductsAddedYet}</p>
        </div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>{t.products}</th>
                <th>{t.category}</th>
                <th>{t.price}</th>
                <th>{t.stock}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.inventory);
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product-info">
                        <strong>{product.name}</strong>
                        {product.description && (
                          <span className="text-muted" style={{ display: 'block', fontSize: '0.8rem' }}>
                            {product.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-muted">{product.category || '—'}</span>
                    </td>
                    <td>{formatCurrency(product.priceMinor, currency)}</td>
                    <td>
                      <span className={`status-badge ${stockStatus.class}`}>
                        {stockStatus.label} ({product.inventory ?? '—'})
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(product)}
                          className="btn-table-edit"
                          title={t.edit}
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="btn-table-delete"
                          title={t.delete}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)} onKeyDown={(e) => { if (e.key === 'Escape') setIsFormOpen(false) }} role="dialog" aria-modal="true" aria-label={t.addProduct}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t.addProduct}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsFormOpen(false)}
                title={t.close}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <ProductForm
                mode="add"
                currency={currency}
                onSuccess={() => setIsFormOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)} onKeyDown={(e) => { if (e.key === 'Escape') setEditingProduct(null) }} role="dialog" aria-modal="true" aria-label={t.editProduct}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t.editProduct}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setEditingProduct(null)}
                title={t.close}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <ProductForm
                mode="edit"
                initialData={editingProduct}
                currency={currency}
                onSuccess={() => setEditingProduct(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
