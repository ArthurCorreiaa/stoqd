import { useState, useEffect } from 'react';
import { api } from '../api';
import { DropdownMenu } from './DropdownMenu';
import { parseCurrencyInput } from '../utils/formatters';
import { supabase } from '../lib/supabase';

interface ProductModalProps {
  productToEdit: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductModal({ productToEdit, onClose, onSuccess }: ProductModalProps) {
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [form, setForm] = useState({ 
    name: '', brandId: '', categoryId: '', quantity: '', 
    averageCost: '', sellingPrice: '', expiryDate: '', imageUrl: ''
  });

  const loadInitialData = async () => {
    try {
      const [bRes, cRes] = await Promise.all([api.get('/brands'), api.get('/categories')]);
      setBrands(bRes.data || []);
      setCategories(cRes.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    loadInitialData();
    if (productToEdit) {
      setForm({
        name: productToEdit.name || '', 
        brandId: productToEdit.brandId ? String(productToEdit.brandId) : '',
        categoryId: productToEdit.categoryId ? String(productToEdit.categoryId) : '', 
        quantity: productToEdit.quantity ? String(productToEdit.quantity) : '',
        averageCost: productToEdit.averageCost ? String(productToEdit.averageCost) : '', 
        sellingPrice: productToEdit.sellingPrice ? String(productToEdit.sellingPrice) : '',
        expiryDate: productToEdit.expiryDate ? new Date(productToEdit.expiryDate).toISOString().split('T')[0] : '',
        imageUrl: productToEdit.imageUrl || ''
      });
    }
  }, [productToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'averageCost' || name === 'sellingPrice' ? parseCurrencyInput(value) : value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `fotos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('produtos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('produtos').getPublicUrl(filePath);

      setForm(prev => ({ ...prev, imageUrl: data.publicUrl }));
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar a imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const payload = {
      name: form.name.trim(),
      brandId: Number(form.brandId), 
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      quantity: Number(form.quantity), 
      averageCost: Number(form.averageCost), 
      sellingPrice: Number(form.sellingPrice),
      expiryDate: form.expiryDate ? new Date(form.expiryDate) : null,
      imageUrl: form.imageUrl || null,
    };

    try {
      if (productToEdit) {
        await api.put(`/products/${productToEdit.id}`, payload);
        alert('Produto atualizado com sucesso!');
      } else {
        await api.post('/products', payload);
        alert('Produto cadastrado com sucesso!');
      }
      onSuccess();
      onClose();
    } catch (err) { alert('Erro ao salvar produto.'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {productToEdit ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Editar Produto
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              Novo Produto
            </>
          )}
        </h2>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="standard-form">
          <div className="form-row">
            <div className="form-group flex-2">
              <label>Nome do Produto</label>
              <input type="text" name="name" required className="input-standard" value={form.name} placeholder='Ex: Arbo' onChange={handleChange} />
            </div>
            <div className="form-group flex-1">
              <label>Data de Validade</label>
              <input type="date" name="expiryDate" className="input-standard input-date-styled" value={form.expiryDate} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ width: '100%' }}>
              <label>Foto do Produto</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                disabled={isUploading}
                className="input-standard"
                style={{ padding: '0.4rem', border: '1px dashed var(--border-color)', cursor: 'pointer' }}
              />
              {isUploading && <p style={{ fontSize: '0.85rem', color: 'var(--accent-color)', marginTop: '4px' }}>Enviando imagem para a nuvem...</p>}
              
              {form.imageUrl && !isUploading && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src={form.imageUrl} 
                    alt="Preview" 
                    style={{ height: '60px', width: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} 
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Imagem carregada com sucesso!</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <DropdownMenu label="Marca" items={brands} selectedId={form.brandId} onSelect={(id) => setForm({...form, brandId: id})} onCreate={async (n) => { await api.post('/brands', { name: n }); loadInitialData(); }} onUpdate={async (id, n) => { await api.put(`/brands/${id}`, { name: n }); loadInitialData(); }} onDelete={async (id) => { await api.delete(`/brands/${id}`); loadInitialData(); }} />
            <DropdownMenu label="Categoria" items={categories} selectedId={form.categoryId} onSelect={(id) => setForm({...form, categoryId: id})} onCreate={async (n) => { await api.post('/categories', { name: n }); loadInitialData(); }} onUpdate={async (id, n) => { await api.put(`/categories/${id}`, { name: n }); loadInitialData(); }} onDelete={async (id) => { await api.delete(`/categories/${id}`); loadInitialData(); }} />
          </div>

          <div className="form-row">
            <div className="form-group flex-1"><label>Qtd</label><input type="number" name="quantity" required className="input-standard" value={form.quantity} placeholder='0' onChange={handleChange} /></div>
            <div className="form-group flex-1"><label>Custo (R$)</label><input type="text" name="averageCost" required className="input-standard" value={form.averageCost} placeholder='0.00' onChange={handleChange} /></div>
            <div className="form-group flex-1"><label>Venda (R$)</label><input type="text" name="sellingPrice" required className="input-standard" value={form.sellingPrice} placeholder='0.00' onChange={handleChange} /></div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting || isUploading}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || isUploading}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}