import { useState, useEffect } from 'react';
import { api } from '../api';

interface CustomerModalProps {
  customerToEdit?: any | null;
  onClose: () => void;
  onSuccess: (savedCustomer?: any) => void;
}

export function CustomerModal({ customerToEdit, onClose, onSuccess }: CustomerModalProps) {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customerToEdit) {
      setForm({ name: customerToEdit.name || '', phone: customerToEdit.phone || '', email: customerToEdit.email || '' });
    }
  }, [customerToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      if (customerToEdit) {
        await api.put(`/customers/${customerToEdit.id}`, form);
        alert('Cliente atualizado com sucesso!');
        onSuccess();
      } else {
        const res = await api.post('/customers', form);
        alert('Cliente adicionado com sucesso!');
        onSuccess(res.data);
      }
      onClose();
    } catch (err) { alert('Erro ao salvar cliente.'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {customerToEdit ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Editar Cliente
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
              Cadastrar Cliente
            </>
          )}
        </h2>
        
        <form className="standard-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="form-group">
            <label>Nome Completo *</label>
            <input type="text" name="name" required className="input-standard" value={form.name} placeholder='Fulano da Silva Sauro' onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Telefone / WhatsApp *</label>
            <input type="text" name="phone" required className="input-standard" value={form.phone} placeholder='(12) 3456-7890' onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>E-mail (Opcional)</label>
            <input type="email" name="email" className="input-standard" value={form.email} placeholder='exemplo@email.com' onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}