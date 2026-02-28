import { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { useProducts } from '../hooks/useProducts';
import { useCustomers } from '../hooks/useCustomers';
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils/formatters';
import { CustomerModal } from '../components/CustomerModal';
import { CheckoutModal } from '../components/CheckoutModal';
import './PDV.css';

export function PDV() {
  const { products, loading, refetch: refetchProducts } = useProducts();
  const { customers, setCustomers } = useCustomers(); 
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart(); 
  
  const [search, setSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirmCheckout = async (paymentType: string, installmentsCount: number) => {
    setIsProcessing(true);
    try {
      await api.post('/sales', {
        customerId: selectedCustomer ? Number(selectedCustomer) : null,
        totalAmount: cartTotal,
        paymentType,
        installmentsCount,
        items: cart.map(item => ({ 
          productId: item.id, 
          quantity: item.cartQuantity, 
          unitPrice: Number(item.activePrice || item.sellingPrice) 
        }))
      });
      
      alert('Venda registrada com sucesso!');
      clearCart();
      setSelectedCustomer('');
      setCustomerSearchText('');
      setIsCheckoutModalOpen(false);
      refetchProducts(); 
    } catch (err) { 
      alert('Erro ao registrar venda.'); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const filteredCustomersList = customers.filter(c => c.name.toLowerCase().includes(customerSearchText.toLowerCase()));

  const handleSelectCustomer = (id: string, name: string) => {
    setSelectedCustomer(id);
    setCustomerSearchText(name);
    setIsCustomerDropdownOpen(false); 
  };

  return (
    <div className="page-container pdv-container">
      <h1 className="page-title pdv-title">Frente de Caixa</h1>

      <main className="pdv-content">
        <section className="pdv-products">
          
          <div className="input-with-icon" style={{ marginBottom: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Buscar produto pelo nome..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              autoFocus 
            />
          </div>

          <div className="products-grid-pdv">
            {loading ? <p className="text-dim">Carregando...</p> : filteredProducts.map(product => {
              const price = Number(product.activePrice || product.sellingPrice || 0);
              const isOutOfStock = product.quantity < 1;
              return (
                <div key={product.id} className={`pdv-item-card ${isOutOfStock ? 'out-of-stock' : ''}`} onClick={() => !isOutOfStock && addToCart(product)}>
                  <div className="item-card-info">
                    <h4>{product.name}</h4>
                    <span className="item-card-brand">{product.brand?.name || 'Sem marca'}</span>
                  </div>
                  <div className="item-card-footer">
                    <span className="price">{formatCurrency(price)}</span>
                    <div className="product-stock">{isOutOfStock ? 'Esgotado' : `${product.quantity} un`}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="pdv-cart base-card">
          <h2 className="cart-title">Resumo da Venda</h2>
          
          <div className="pdv-customer-section">
            <div className="custom-select-wrapper" ref={dropdownRef}>
              <svg className="select-icon user-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
              </svg>

              <input 
                type="text" className="pdv-customer-select" placeholder="Consumidor Final (Sem Cadastro)"
                value={customerSearchText}
                onChange={(e) => {
                  setCustomerSearchText(e.target.value);
                  setIsCustomerDropdownOpen(true);
                  if (selectedCustomer) setSelectedCustomer(''); 
                }}
                onFocus={() => setIsCustomerDropdownOpen(true)}
              />

              {customerSearchText ? (
                <svg className="select-icon chevron-icon clear-icon" onClick={() => handleSelectCustomer('', '')} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg className="select-icon chevron-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}

              {isCustomerDropdownOpen && (
                <div className="customer-dropdown-menu">
                  <div className="customer-dropdown-item special-item" onClick={() => handleSelectCustomer('', '')}>
                    👤 Consumidor Final (Sem Cadastro)
                  </div>
                  {filteredCustomersList.map(c => (
                    <div key={c.id} className="customer-dropdown-item" onClick={() => handleSelectCustomer(String(c.id), c.name)}>
                      {c.name} <span className="text-dim" style={{fontSize: '0.8rem', marginLeft: '8px'}}>{c.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="btn-new-customer" onClick={() => setIsCustomerModalOpen(true)}>+ Novo</button>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', opacity: 0.5 }}>
                  <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <br/>Carrinho vazio
              </div>
            ) : (
              cart.map(item => {
                const price = Number(item.activePrice || item.sellingPrice || 0);
                return (
                  <div key={item.id} className="cart-item">
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <span className="item-price">{item.cartQuantity}x {formatCurrency(price)}</span>
                    </div>
                    <div className="item-controls">
                      <div className="qty-controls">
                        <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                        <span>{item.cartQuantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                      </div>
                      <span className="item-subtotal">{formatCurrency(price * item.cartQuantity)}</span>
                      <button className="btn-remove" onClick={() => removeFromCart(item.id)}>✕</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="cart-footer">
            <div className="total-row">
              <span className="total-label">TOTAL</span>
              <h2 className="total-value">{formatCurrency(cartTotal)}</h2>
            </div>
            <button className="btn-primary" style={{width: '100%', padding: '1.2rem'}} disabled={cart.length === 0} onClick={() => setIsCheckoutModalOpen(true)}>
              Prosseguir Pagamento
            </button>
          </div>
        </section>
      </main>

      <CheckoutModal 
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onConfirm={handleConfirmCheckout}
        totalAmount={cartTotal}
        customers={customers}
        selectedCustomerId={selectedCustomer}
        isProcessing={isProcessing}
      />

      {isCustomerModalOpen && (
        <CustomerModal 
          onClose={() => setIsCustomerModalOpen(false)}
          onSuccess={(newCustomer) => {
            if (newCustomer) {
              setCustomers([...customers, newCustomer]);
              handleSelectCustomer(String(newCustomer.id), newCustomer.name);
            }
          }}
        />
      )}
    </div>
  );
}