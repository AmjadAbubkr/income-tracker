import { useMemo, useState } from 'react';
import { Product } from '../types';
import { formatCurrency } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';
import ProductForm from './ProductForm';

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

interface ProductsPageProps {
  products: Product[];
  onDeleteProduct: (id: string) => void;
  onEditProduct: (productData: Omit<Product, 'id' | 'createdAt'>, id: string) => Promise<void>;
  onAddProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  currency: string;
  searchQuery: string;
}

export default function ProductsPage({
  products,
  onDeleteProduct,
  onEditProduct,
  onAddProduct,
  currency,
  searchQuery
}: ProductsPageProps) {
  const { t } = useLanguage();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(t.all);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return [t.all, ...Array.from(cats)];
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
      await onEditProduct(productData, editingProduct.id);
      setEditingProduct(null);
    }
  };

  const handleAddSubmit = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    await onAddProduct(productData);
    setIsFormOpen(false);
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>{t.inventory}</h1>
        <button onClick={() => setIsFormOpen(true)} className="btn btn-primary">
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
                    <td>{formatCurrency(product.price, currency)}</td>
                    <td>
                      <span className={`status-badge ${stockStatus.class}`}>
                        {stockStatus.label} ({product.inventory ?? '—'})
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="btn-table-edit"
                          title={t.edit}
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t.confirmDeleteProduct)) {
                              onDeleteProduct(product.id);
                            }
                          }}
                          className="btn-table-delete"
                          title={t.delete}
                        >
                          🗑️
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
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t.addProduct}</h2>
              <button
                className="modal-close"
                onClick={() => setIsFormOpen(false)}
                title={t.close}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <ProductForm
                onSubmit={handleAddSubmit}
                onCancel={() => setIsFormOpen(false)}
                currency={currency}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t.editProduct}</h2>
              <button
                className="modal-close"
                onClick={() => setEditingProduct(null)}
                title={t.close}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <ProductForm
                onSubmit={handleEditSubmit}
                onCancel={() => setEditingProduct(null)}
                currency={currency}
                hideCancel={true}
                initialData={editingProduct}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
