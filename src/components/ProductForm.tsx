import { useState, FormEvent } from 'react';
import { Product } from '../types';
import { getCurrency } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';
import { useProductMutations } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';

// Professional SVG icon
const CameraIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

interface ProductFormProps {
  mode: 'add' | 'edit';
  initialData?: Product;
  currency: string;
  onSuccess?: () => void;
}

export default function ProductForm({ mode, initialData, currency, onSuccess }: ProductFormProps) {
  const { t } = useLanguage();
  const currencyInfo = getCurrency(currency);
  const mutations = useProductMutations();
  const { data: categories = [] } = useCategories();

  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [price, setPrice] = useState(initialData?.price.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [inventory, setInventory] = useState<string>(initialData?.inventory !== undefined ? initialData.inventory.toString() : '');
  const [trackInventory, setTrackInventory] = useState(initialData?.inventory !== undefined);
  const [image, setImage] = useState<string>(initialData?.image || '');
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image || '');
  const [error, setError] = useState<string>('');

  const isPending = mutations.create.isPending || mutations.update.isPending;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(t.selectImageFile);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t.imageSizeLimit);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage('');
    setImagePreview('');
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !price.trim()) {
      alert(t.fillProductNamePrice);
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert(t.validPrice);
      return;
    }

    let inventoryNum: number | undefined = undefined;
    if (trackInventory && inventory.trim()) {
      inventoryNum = parseInt(inventory.trim(), 10);
      if (isNaN(inventoryNum) || inventoryNum < 0) {
        alert(t.validInventory);
        return;
      }
    }

    const formData = {
      name: name.trim(),
      price: priceNum,
      description: description.trim() || undefined,
      inventory: trackInventory ? inventoryNum : undefined,
      image: image || undefined,
      category: category || undefined,
    };

    if (mode === 'edit' && initialData) {
      mutations.update.mutate(
        { id: initialData.id, data: formData },
        {
          onSuccess: () => {
            setName('');
            setPrice('');
            setDescription('');
            setCategory('');
            setInventory('');
            setTrackInventory(false);
            setImage('');
            setImagePreview('');
            onSuccess?.();
          },
          onError: (err) => {
            setError(err.message || t.failedToUpdateProduct || 'Failed to update product');
          },
        }
      );
    } else {
      mutations.create.mutate(formData, {
        onSuccess: () => {
          setName('');
          setPrice('');
          setDescription('');
          setCategory('');
          setInventory('');
          setTrackInventory(false);
          setImage('');
          setImagePreview('');
          onSuccess?.();
        },
        onError: (err) => {
          setError(err.message || t.failedToAddProduct || 'Failed to add product');
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h2>{mode === 'edit' ? t.editProduct : t.addNewProduct}</h2>

      {error && (
        <div className="form-error" style={{ color: 'var(--error-color, #e53e3e)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(229, 62, 62, 0.1)', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name">{t.productName} *</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.enterProductName}
          required
          disabled={isPending}
        />
      </div>
      <div className="form-group">
        <label htmlFor="price">{t.price} ({currencyInfo.symbol}) *</label>
        <div className="price-input-wrapper">
          <span className="price-symbol">{currencyInfo.symbol}</span>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            required
            className="price-input"
            disabled={isPending}
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="category">{t.category}</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isPending}
        >
          <option value="">{t.selectCategory}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="description">{t.description}</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.optionalDescription}
          rows={3}
          disabled={isPending}
        />
      </div>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={trackInventory}
            onChange={(e) => {
              setTrackInventory(e.target.checked);
              if (!e.target.checked) {
                setInventory('');
              }
            }}
            style={{ marginRight: '0.5rem' }}
            disabled={isPending}
          />
          {t.trackInventoryLabel}
        </label>
        {trackInventory && (
          <input
            type="number"
            min="0"
            step="1"
            value={inventory}
            onChange={(e) => setInventory(e.target.value)}
            placeholder={t.initialStockQuantity}
            className="inventory-input"
            disabled={isPending}
          />
        )}
      </div>
      <div className="form-group">
        <label htmlFor="image">{t.productImage}</label>
        <div className="image-upload-section">
          {imagePreview ? (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Product preview" className="image-preview" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="btn-remove-image"
                title={t.delete}
                disabled={isPending}
              >
                ×
              </button>
            </div>
          ) : (
            <div className="image-upload-placeholder">
              <label htmlFor="image" className="image-upload-label">
                <span className="upload-icon"><CameraIcon /></span>
                <span>{t.clickToUploadImage}</span>
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
                disabled={isPending}
              />
            </div>
          )}
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? (mode === 'edit' ? (t.updating || 'Updating...') : (t.adding || 'Adding...')) : (mode === 'edit' ? t.updateProduct : t.addProduct)}
        </button>
        {onSuccess && (
          <button type="button" onClick={onSuccess} className="btn btn-secondary" disabled={isPending}>
            {t.cancel}
          </button>
        )}
      </div>
    </form>
  );
}
