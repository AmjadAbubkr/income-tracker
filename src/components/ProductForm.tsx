import { useState, FormEvent } from 'react';
import { Product } from '../types';
import { getCurrency } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';

// Professional SVG icon
const CameraIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

interface ProductFormProps {
  onSubmit: (product: Omit<Product, 'id' | 'createdAt'>) => void | Promise<void>;
  onCancel?: () => void;
  currency: string;
  hideCancel?: boolean;
  initialData?: Product;
}

export default function ProductForm({ onSubmit, onCancel, currency, hideCancel, initialData }: ProductFormProps) {
  const { t } = useLanguage();
  const currencyInfo = getCurrency(currency);
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [price, setPrice] = useState(initialData?.price.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [inventory, setInventory] = useState<string>(initialData?.inventory !== undefined ? initialData.inventory.toString() : '');
  const [trackInventory, setTrackInventory] = useState(initialData?.inventory !== undefined);
  const [image, setImage] = useState<string>(initialData?.image || '');
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image || '');

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

    try {
      await onSubmit({
        name: name.trim(),
        price: priceNum,
        description: description.trim() || undefined,
        inventory: trackInventory ? inventoryNum : undefined,
        image: image || undefined,
        category: category || undefined,
      });

      // Reset form only after successful submission
      setName('');
      setPrice('');
      setDescription('');
      setCategory('');
      setInventory('');
      setTrackInventory(false);
      setImage('');
      setImagePreview('');
    } catch (error) {
      console.error('Error submitting product:', error);
      alert(t.failedToAddProduct);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h2>{initialData ? t.editProduct : t.addNewProduct}</h2>
      <div className="form-group">
        <label htmlFor="name">{t.productName} *</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.enterProductName}
          required
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
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="category">{t.category}</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">{t.selectCategory}</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Home & Garden">Home & Garden</option>
          <option value="Toys">Toys</option>
          <option value="Health & Beauty">Health & Beauty</option>
          <option value="Automotive">Automotive</option>
          <option value="Books">Books</option>
          <option value="Other">Other</option>
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
              />
            </div>
          )}
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {initialData ? t.updateProduct : t.addProduct}
        </button>
        {onCancel && !hideCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            {t.cancel}
          </button>
        )}
      </div>
    </form>
  );
}

