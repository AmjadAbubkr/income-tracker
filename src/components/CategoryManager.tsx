import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCategories, useCategoryMutations } from '../hooks/useCategories';

export default function CategoryManager() {
  const { t } = useLanguage();
  const { data: categories = [], isLoading } = useCategories();
  const mutations = useCategoryMutations();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newCategoryName.trim()) return;

    mutations.create.mutate(
      { name: newCategoryName.trim() },
      {
        onSuccess: () => setNewCategoryName(''),
        onError: (err) => {
          if (err.message.includes('409')) {
            setError(t.categoryAlreadyExists || 'Category already exists');
          } else {
            setError(err.message || 'Failed to create category');
          }
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t.confirmDeleteCategory || 'Delete this category?')) {
      mutations.delete.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="category-manager"><p>{t.loading}</p></div>;
  }

  return (
    <div className="category-manager">
      <h3>{t.manageCategories || 'Manage Categories'}</h3>

      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          name="categoryName"
          autoComplete="off"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder={t.enterCategoryName || 'Enter category name…'}
          style={{ flex: 1, padding: '0.5rem' }}
          aria-label={t.enterCategoryName || 'Enter category name'}
        />
        <button type="submit" className="btn btn-primary" disabled={mutations.create.isPending}>
          {mutations.create.isPending ? (t.adding || 'Adding…') : (t.addCategory || 'Add')}
        </button>
      </form>

      {error && (
        <div role="alert" aria-live="polite" style={{ color: 'var(--error)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {categories.length === 0 ? (
        <p className="text-muted">{t.noCategories || 'No categories yet'}</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {categories.map((cat) => (
            <li
              key={cat.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <span>{cat.name}</span>
              <button
                onClick={() => handleDelete(cat.id)}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                disabled={mutations.delete.isPending}
                type="button"
              >
                {t.delete}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
