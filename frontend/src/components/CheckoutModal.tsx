import { useState } from 'react';
import { formatCurrency } from '../utils/formatters';
import './CheckoutModal.css';

interface CheckoutModalProps {
  isOpen: boolean; onClose: () => void;
  onConfirm: (paymentType: 'VISTA' | 'PRAZO', installmentsCount: number) => void;
  totalAmount: number; customers: any[]; selectedCustomerId: string; isProcessing: boolean;
}

export function CheckoutModal({ isOpen, onClose, onConfirm, totalAmount, customers, selectedCustomerId, isProcessing }: CheckoutModalProps) {
  const [paymentType, setPaymentType] = useState<'VISTA' | 'PRAZO'>('VISTA');
  const [installmentsCount, setInstallmentsCount] = useState<number>(1);

  if (!isOpen) return null;
  const selectedCustomer = customers.find(c => String(c.id) === selectedCustomerId);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Finalizar Pagamento</h2>
        
        <div className="checkout-total-box">
          <span>Total da Venda</span><h3>{formatCurrency(totalAmount)}</h3>
        </div>

        <div className="standard-form">
          <div className="form-group">
            <label>Forma de Pagamento</label>
            <select className="input-standard checkout-select" value={paymentType} onChange={(e) => setPaymentType(e.target.value as 'VISTA' | 'PRAZO')}>
              <option value="VISTA">💳 À Vista (Dinheiro / Pix / Cartão)</option>
              {selectedCustomer && <option value="PRAZO">📝 A Prazo (Fiado para {selectedCustomer.name})</option>}
            </select>
            {!selectedCustomer && <small className="checkout-warning">*Para vender a prazo, selecione um cliente.</small>}
          </div>

          {paymentType === 'PRAZO' && (
            <div className="form-group">
              <label>Número de Parcelas</label>
              <select className="input-standard checkout-select" value={installmentsCount} onChange={(e) => setInstallmentsCount(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num}x de {formatCurrency(totalAmount / num)}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-actions" style={{ marginTop: '2rem' }}>
            <button className="btn-secondary" onClick={onClose} disabled={isProcessing}>Voltar</button>
            <button className="btn-primary" onClick={() => onConfirm(paymentType, installmentsCount)} disabled={isProcessing}>
              {isProcessing ? 'Processando...' : 'Confirmar Venda'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}