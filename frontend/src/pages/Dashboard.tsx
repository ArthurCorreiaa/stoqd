import { useState, useMemo, useRef, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';
import { formatCurrency } from '../utils/formatters';
import './Dashboard.css';

function SearchableFilter({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="filter-group" ref={ref}>
      <label>{label}</label>
      <div className="custom-select-wrapper">
        <div className="filter-select" onClick={() => { setIsOpen(!isOpen); setSearch(''); }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
        </div>
        {isOpen && (
          <div className="filter-dropdown-menu">
            <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)' }}>
              <input 
                type="text" className="input-standard" style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }} 
                placeholder="Pesquisar..." autoFocus value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-dropdown-list">
              {filtered.map(opt => (
                <div key={opt} className={`filter-dropdown-item ${value === opt ? 'selected' : ''}`} onClick={() => { onChange(opt); setIsOpen(false); }}>
                  {opt}
                </div>
              ))}
              {filtered.length === 0 && <div className="filter-dropdown-item" style={{ color: 'var(--text-dim)', textAlign: 'center' }}>Nenhum encontrado</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        {payload.map((entry: any, index: number) => {
          const isRevenue = entry.dataKey === 'revenue';
          const name = isRevenue ? 'Receita Gerada' : 'Unidades Vendidas';
          const val = isRevenue ? formatCurrency(entry.value) : `${entry.value} un`;
          return (
            <p key={index} className="item" style={{ color: entry.color }}>
              {name}: {val}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const { products, loading: loadingProducts } = useProducts();
  const { sales, loading: loadingSales } = useSales();

  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y'>('1M');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas');

  const categories = useMemo(() => ['Todas', ...Array.from(new Set(products.map(p => p.category?.name).filter(Boolean)))], [products]);
  const brands = useMemo(() => ['Todas', ...Array.from(new Set(products.map(p => p.brand?.name).filter(Boolean)))], [products]);

  const soldItems = useMemo(() => {
    const items: any[] = [];
    sales.forEach(sale => {
      const date = new Date(sale.date || sale.createdAt || new Date());
      (sale.items || []).forEach((item: any) => {
        const product = products.find(p => p.id === item.productId);
        items.push({
          date, quantity: Number(item.quantity) || 0,
          revenue: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
          productName: product ? product.name : 'Produto Excluído',
          brand: product?.brand?.name || 'Sem Marca', category: product?.category?.name || 'Sem Categoria'
        });
      });
    });
    return items;
  }, [sales, products]);

  const filteredSoldItems = useMemo(() => {
    return soldItems.filter(item => {
      const matchCat = selectedCategory === 'Todas' || item.category === selectedCategory;
      const matchBrand = selectedBrand === 'Todas' || item.brand === selectedBrand;
      return matchCat && matchBrand;
    });
  }, [soldItems, selectedCategory, selectedBrand]);

  const temporalData = useMemo(() => {
    const groups: Record<string, { period: string, revenue: number, quantity: number, sortKey: string }> = {};
    const today = new Date();
    const cutoffDate = new Date();
    cutoffDate.setHours(0,0,0,0);

    if (timeRange === '1M') {
      cutoffDate.setDate(today.getDate() - 29); 
      for (let i = 0; i < 30; i++) {
        const d = new Date(cutoffDate);
        d.setDate(d.getDate() + i);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const periodKey = `${day}/${month}`;
        groups[periodKey] = { period: periodKey, revenue: 0, quantity: 0, sortKey: `${d.getFullYear()}-${month}-${day}` };
      }
    } else {
      const monthsToGoBack = timeRange === '3M' ? 2 : timeRange === '6M' ? 5 : 11;
      cutoffDate.setMonth(today.getMonth() - monthsToGoBack);
      cutoffDate.setDate(1); 
      for (let i = 0; i <= monthsToGoBack; i++) {
        const d = new Date(cutoffDate);
        d.setMonth(d.getMonth() + i);
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const periodKey = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(-2)}`;
        groups[periodKey] = { period: periodKey, revenue: 0, quantity: 0, sortKey: `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}` };
      }
    }

    filteredSoldItems.forEach(item => {
      const d = new Date(item.date);
      if (d < cutoffDate) return; 

      let periodKey = '';
      if (timeRange === '1M') {
        periodKey = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else {
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        periodKey = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(-2)}`;
      }

      if (groups[periodKey]) {
        groups[periodKey].revenue += item.revenue;
        groups[periodKey].quantity += item.quantity;
      }
    });

    return Object.values(groups).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [filteredSoldItems, timeRange]);

  const topProductsData = useMemo(() => {
    const groups: Record<string, { name: string, quantity: number }> = {};
    const cutoffDate = new Date();
    if (timeRange === '1M') cutoffDate.setDate(cutoffDate.getDate() - 30);
    if (timeRange === '3M') cutoffDate.setMonth(cutoffDate.getMonth() - 3);
    if (timeRange === '6M') cutoffDate.setMonth(cutoffDate.getMonth() - 6);
    if (timeRange === '1Y') cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);

    filteredSoldItems.forEach(item => {
      const d = new Date(item.date);
      if (d >= cutoffDate) {
        if (!groups[item.productName]) groups[item.productName] = { name: item.productName, quantity: 0 };
        groups[item.productName].quantity += item.quantity;
      }
    });
    return Object.values(groups).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
  }, [filteredSoldItems, timeRange]);

  const totalRevenue = temporalData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalItemsSold = temporalData.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Inteligência de Vendas (BI)</h1>
        <p className="subtitle">Análise de Performance de Produtos</p>
      </div>

      {loadingProducts || loadingSales ? (
        <div className="loading-state" style={{ marginTop: '4rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}>📊</div>
          Analisando inteligência de dados...
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card base-card profit">
              <span className="label">Receita Bruta Gerada</span>
              <h2 className="value">{formatCurrency(totalRevenue)}</h2>
            </div>
            <div className="stat-card base-card">
              <span className="label">Unidades Vendidas</span>
              <h2 className="value">{totalItemsSold}</h2>
            </div>
            <div className="stat-card base-card">
              <span className="label">Ticket Médio (Por Item)</span>
              <h2 className="value">{formatCurrency(totalItemsSold > 0 ? totalRevenue / totalItemsSold : 0)}</h2>
            </div>
          </div>

          <div className="dashboard-filters" style={{ alignItems: 'flex-end' }}>
            
            <div className="filter-group">
              <label>Período de Análise</label>
              <div className="time-pills">
                <button className={`time-pill ${timeRange === '1M' ? 'active' : ''}`} onClick={() => setTimeRange('1M')}>Mês</button>
                <button className={`time-pill ${timeRange === '3M' ? 'active' : ''}`} onClick={() => setTimeRange('3M')}>3 Meses</button>
                <button className={`time-pill ${timeRange === '6M' ? 'active' : ''}`} onClick={() => setTimeRange('6M')}>6 Meses</button>
                <button className={`time-pill ${timeRange === '1Y' ? 'active' : ''}`} onClick={() => setTimeRange('1Y')}>1 Ano</button>
              </div>
            </div>

            <SearchableFilter label="Filtrar por Categoria" options={categories as string[]} value={selectedCategory} onChange={setSelectedCategory} />
            <SearchableFilter label="Filtrar por Marca" options={brands as string[]} value={selectedBrand} onChange={setSelectedBrand} />
          </div>

          <div className="charts-grid">
            
            <div className="charts-left-column">
              
              <div className="chart-card base-card">
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0 }}>
                    Fluxo de Caixa 
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginLeft: '8px', fontWeight: 'normal' }}>
                      (R$)
                    </span>
                  </h3>
                </div>
                
                <div className="chart-container" style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={temporalData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                      <XAxis dataKey="period" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis 
                        stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} 
                        tickFormatter={(v) => `R$${v}`} 
                        domain={[0, (dataMax: number) => Math.max(100, dataMax)]} 
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                      <Line type="monotone" dataKey="revenue" stroke="var(--success-color)" strokeWidth={3} dot={{ r: 3, fill: 'var(--success-color)' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card base-card">
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0 }}>
                    Volume de Vendas 
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginLeft: '8px', fontWeight: 'normal' }}>
                      (Unidades)
                    </span>
                  </h3>
                </div>
                
                <div className="chart-container" style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={temporalData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                      <XAxis dataKey="period" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis 
                        stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} 
                        domain={[0, (dataMax: number) => Math.max(3, dataMax)]} 
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                      <Bar dataKey="quantity" fill="var(--accent-color)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            <div className="chart-card base-card">
              <h3>Ranking: Top 10 Produtos</h3>
              
              <div className="chart-container" style={{ width: '100%', height: 500, marginTop: '1.5rem' }}>
                {topProductsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={topProductsData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                      <XAxis type="number" stroke="var(--text-dim)" fontSize={12} hide />
                      <YAxis type="category" dataKey="name" stroke="var(--text-dim)" fontSize={11} tickLine={false} axisLine={false} width={120} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                      <Bar dataKey="quantity" fill="#00f2ff" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-cart" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                    Nenhuma venda neste período.
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}