import { useState } from 'react';
import { api } from '../api';
import { useProducts } from '../hooks/useProducts';
import { formatCurrency } from '../utils/formatters';
import { ProductModal } from '../components/ProductModal';

export function Inventory() {
  const { products, loading, refetch: refetchProducts } = useProducts();
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any | null>(null);

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Tem certeza que deseja apagar TODOS os itens deste produto?")) {
      try {
        await api.delete(`/products/${id}`);
        refetchProducts();
      } catch (err) { alert("Erro ao excluir produto."); }
    }
  };

  const openEditModal = (product: any) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Gestão de Estoque</h1>
      </div>

      <section className="page-card base-card">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
          
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <div className="input-with-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Buscar produto ou marca..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <button className="btn-primary" onClick={() => { setProductToEdit(null); setIsModalOpen(true); }} style={{ whiteSpace: 'nowrap' }}>
            + Novo Produto
          </button>

        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Estoque</th>
                <th>Custo Unit.</th>
                <th>Venda Unit.</th>
                <th>Lucro Unit.</th>
                <th className="highlight-col">Lucro Total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Carregando estoque...</td></tr>
              ) : filteredProducts.map((p: any) => {
                const custo = Number(p.averageCost) || 0;
                const venda = Number(p.activePrice || p.sellingPrice) || 0;
                const qtd = Number(p.quantity) || 0;
                const lucroUnit = venda - custo;

                return (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong><br /><small className="text-dim">{p.brand?.name}</small></td>
                    <td><span className={`badge ${qtd <= 3 ? 'badge-danger' : 'badge-success'}`}>{qtd} un</span></td>
                    <td className="text-dim">{formatCurrency(custo)}</td>
                    <td>{formatCurrency(venda)}</td>
                    <td className="text-success">+{formatCurrency(lucroUnit)}</td>
                    <td className="highlight-cell text-success"><strong>{formatCurrency(lucroUnit * qtd)}</strong></td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit-text" onClick={() => openEditModal(p)}>Editar</button>
                        <button className="btn-delete-text" onClick={() => handleDeleteProduct(p.id)}>Remover</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredProducts.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Nenhum produto encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <ProductModal 
          productToEdit={productToEdit}
          onClose={() => { setIsModalOpen(false); setProductToEdit(null); }}
          onSuccess={refetchProducts}
        />
      )}
    </div>
  );
}