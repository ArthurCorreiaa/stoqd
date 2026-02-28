import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { formatCurrency } from '../utils/formatters';
import './Home.css';

export function Home() {
  const { products, loading } = useProducts();
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const brands = useMemo(() => {
    return ['Todas', ...Array.from(new Set(products.map(p => p.brand?.name).filter(Boolean)))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchBrand = selectedBrand === 'Todas' || p.brand?.name === selectedBrand;
      const matchSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBrand && matchSearch;
    });
  }, [products, selectedBrand, searchQuery]);

  if (loading) return <div className="loading-state">Carregando vitrine...</div>;

  return (
    <div className="home-container">
      <main className="home-content">
        <section className="brands-filter">
          <span className="filter-label">MARCAS</span>
          <div className="filter-buttons">
            {brands.map(brand => (
              <button 
                key={brand as string}
                className={`btn-filter ${selectedBrand === brand ? 'active' : ''}`}
                onClick={() => setSelectedBrand(brand as string)}
              >
                {brand as string}
              </button>
            ))}
          </div>
        </section>

        <h2 className="page-title">
          Produtos ({filteredProducts.length}) {searchQuery && `- Buscando por "${searchQuery}"`}
        </h2>

        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card base-card">
              <div className="product-image-placeholder">📦</div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <span className={`badge ${product.quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                  Estoque: {product.quantity}
                </span>
                <span className="product-price">{formatCurrency(product.sellingPrice)}</span>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
             <div style={{ color: 'var(--text-dim)', marginTop: '2rem' }}>Nenhum produto encontrado.</div>
          )}
        </div>
      </main>
    </div>
  );
}