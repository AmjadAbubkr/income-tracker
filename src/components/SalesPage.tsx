import { useState } from 'react';
import { Product, IncomeEntry } from '../types';
import ProductForm from './ProductForm';
import IncomeEntryForm from './IncomeEntryForm';
import { useLanguage } from '../context/LanguageContext';

// SVG Icons
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const DollarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  const handleProductSubmit = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    await onAddProduct(productData);
    setIsFormOpen(false);
  };

  const handleIncomeSubmit = async (entryData: Omit<IncomeEntry, 'id'>) => {
    await onAddIncome(entryData);
    // Don't close modal - allow multiple entries
  };

  return (
    <div className="sales-page">
      <div className="page-header">
        <h1>{t.sales}</h1>
        <div className="sales-actions">
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn btn-primary btn-add"
          >
            <PlusIcon /> {t.addProduct}
          </button>
          <button
            onClick={() => setShowIncomeModal(true)}
            className="btn btn-primary btn-add"
          >
            <DollarIcon /> {t.recordIncome}
          </button>
        </div>
      </div>

      <div className="sales-content">
        {products.length === 0 ? (
          <div className="sales-empty-state">
            <p>{t.noProductsAvailable} {t.clickToAddProduct}</p>
          </div>
        ) : (
          <IncomeEntryForm
            products={products}
            onSubmit={handleIncomeSubmit}
            currency={currency}
            onDeleteProduct={onDeleteProduct}
            showTitle={false}
            formId="sales-main-form"
          />
        )}
      </div>

      {/* Product Modal */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t.addNewProduct}</h2>
              <button
                className="modal-close"
                onClick={() => setIsFormOpen(false)}
                title={t.close}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {isFormOpen && (
                <ProductForm
                  onSubmit={handleProductSubmit}
                  onCancel={() => setIsFormOpen(false)}
                  currency={currency}
                  hideCancel={true}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Income Entry Modal */}
      {showIncomeModal && (
        <div className="modal-overlay" onClick={() => setShowIncomeModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t.recordIncome}</h2>
              <button
                className="modal-close"
                onClick={() => setShowIncomeModal(false)}
                title={t.close}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {showIncomeModal && (
                <IncomeEntryForm
                  products={products}
                  onSubmit={handleIncomeSubmit}
                  onCancel={() => setShowIncomeModal(false)}
                  currency={currency}
                  onDeleteProduct={onDeleteProduct}
                  showTitle={false}
                  formId="sales-modal-form"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

