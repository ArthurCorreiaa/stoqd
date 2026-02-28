import { useState, useEffect } from 'react';
import { api } from '../api';
import { formatCurrency } from '../utils/formatters';
import { useProducts } from '../hooks/useProducts'; 
import './CustomerStatementModal.css';

interface Props {
  activeCustomer: any;
  onClose: () => void;
  onRefresh: () => void;
}

export function CustomerStatementModal({ activeCustomer, onClose, onRefresh }: Props) {
  const [expandedSales, setExpandedSales] = useState<number[]>([]);
  const { products } = useProducts(); 

  useEffect(() => {
    if (activeCustomer) {
      const pendingSaleIds = (activeCustomer.sales || [])
        .filter((s: any) => s.installments?.some((i: any) => !i.paidAt))
        .map((s: any) => s.id);
      setExpandedSales(pendingSaleIds);
    }
  }, [activeCustomer]);

  if (!activeCustomer) return null;

  const toggleSale = (saleId: number) => {
    setExpandedSales(prev =>
      prev.includes(saleId) ? prev.filter(id => id !== saleId) : [...prev, saleId]
    );
  };

  const handlePay = async (installmentId: number) => {
    try {
      await api.patch(`/installments/${installmentId}/pay`, { paidAt: new Date().toISOString() });
      onRefresh();
    } catch (err) {
      alert('Erro ao processar a baixa da parcela.');
    }
  };

  const formatDateBR = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit' 
    });
  };

  const sortedSales = [...(activeCustomer.sales || [])].sort((a, b) =>
    new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content statement-modal">
        
        <div className="statement-header">
          <h2>Histórico: {activeCustomer.name}</h2>
          <button className="btn-secondary" onClick={onClose}>✕ Fechar</button>
        </div>

        <div className="statement-legend">
          <span className="legend-item"><div className="box paid"></div> Pago em dia</span>
          <span className="legend-item"><div className="box paid-late"></div> Pago com atraso</span>
          <span className="legend-item"><div className="box pending"></div> A vencer</span>
          <span className="legend-item"><div className="box overdue"></div> Atrasado</span>
        </div>

        <div className="statement-sales-list">
          {sortedSales.length === 0 ? (
            <p className="empty-state" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum histórico de compras.</p>
          ) : (
            sortedSales.map((sale: any) => {
              const isExpanded = expandedSales.includes(sale.id);

              const sortedInstallments = [...(sale.installments || [])].sort((a, b) =>
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
              );

              const productNames = sale.items && sale.items.length > 0
                ? sale.items.map((i: any) => {
                    const prod = products.find(p => p.id === i.productId);
                    const name = prod?.name || i.product?.name || 'Produto Excluído/Desconhecido';
                    return `${i.quantity > 1 ? i.quantity + 'x ' : ''}${name}`;
                  }).join(', ')
                : 'Produtos não especificados';

              return (
                <div key={sale.id} className="sale-accordion-card">
                  
                  <div className="sale-accordion-header" onClick={() => toggleSale(sale.id)}>
                    <div className="sale-info-left">
                      <h4>Venda #{sale.id} - {formatDateBR(sale.createdAt || sale.date)}</h4>
                      <span className="sale-products-label" title={productNames}>{productNames}</span>
                    </div>
                    <div className="sale-info-right">
                      <span className="sale-total">{formatCurrency(sale.total)}</span>
                      <svg
                        className={`chevron-icon ${isExpanded ? 'expanded' : ''}`}
                        xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="sale-accordion-body">
                      
                      <div className="installments-squares">
                        {sortedInstallments.map((inst: any, idx: number) => {
                          let statusClass = 'pending';
                          
                          if (inst.paidAt) {
                            const paidDate = new Date(inst.paidAt);
                            const dueDate = new Date(inst.dueDate);

                            paidDate.setHours(0,0,0,0);
                            dueDate.setHours(0,0,0,0);
                            
                            if (paidDate > dueDate) {
                              statusClass = 'paid-late';
                            } else {
                              statusClass = 'paid';
                            }

                          } else {
                            const today = new Date();
                            const dueDate = new Date(inst.dueDate);
                            today.setHours(0,0,0,0);
                            dueDate.setHours(0,0,0,0);
                            
                            if (dueDate < today) {
                              statusClass = 'overdue';
                            }
                          }

                          return (
                            <div key={inst.id} className={`inst-square ${statusClass}`} title={`Parcela ${idx + 1}`}>
                              {idx + 1}
                            </div>
                          );
                        })}
                      </div>

                      <div className="installments-list">
                        <h5 className="installments-title">Próximos pagamentos:</h5>
                        {sortedInstallments.filter((i: any) => !i.paidAt).length === 0 ? (
                          <p className="text-dim" style={{ fontSize: '0.85rem' }}>Todas as parcelas pagas! 🎉</p>
                        ) : (
                          sortedInstallments.map((inst: any, idx: number) => {
                            if (inst.paidAt) return null;
                            
                            return (
                              <div key={inst.id} className="installment-row">
                                <span className="inst-name">Parcela {idx + 1} - {formatCurrency(Number(inst.value))}</span>
                                <div className="inst-actions">
                                  <span className="inst-date">Vence: {formatDateBR(inst.dueDate)}</span>
                                  <button className="btn-pay" onClick={() => handlePay(inst.id)}>Baixar</button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}