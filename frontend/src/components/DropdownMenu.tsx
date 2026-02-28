import { useState, useRef, useEffect, useMemo } from 'react';
import './DropdownMenu.css';

interface Item {
  id: number;
  name: string;
}

interface DropdownMenuProps {
  label: string;
  items: Item[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  placeholder?: string;
}

export function DropdownMenu({ label, items, selectedId, onSelect, onCreate, onUpdate, onDelete, placeholder }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setEditingId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())), [items, search]);
  const exactMatch = useMemo(() => items.find(i => i.name.toLowerCase() === search.toLowerCase()), [items, search]);
  const selectedItem = items.find(i => String(i.id) === String(selectedId));

  return (
    <div className="form-group flex-1" ref={dropdownRef}>
      <label>{label}</label>
      <div className="dropdown-container">
        
        <div className={`dropdown-trigger ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
          <span className={selectedItem ? 'selected-text' : 'placeholder-text'}>
            {selectedItem ? selectedItem.name : (placeholder || 'Selecione...')}
          </span>
          <span className="dropdown-arrow">▼</span>
        </div>

        {isOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-search-container">
              <input 
                type="text" className="dropdown-search" autoFocus
                placeholder="Procurar ou criar..."
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="dropdown-list">
              {filtered.map(item => (
                <div key={item.id} className={`dropdown-item ${String(selectedId) === String(item.id) ? 'selected' : ''}`}
                  onClick={() => {
                    if (editingId !== item.id) {
                      onSelect(String(item.id));
                      setIsOpen(false);
                      setSearch('');
                    }
                  }}>
                  
                  {editingId === item.id ? (
                    <div className="edit-mode-container">
                      <input 
                        className="edit-item-input" autoFocus value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { onUpdate(item.id, editName); setEditingId(null); }
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onBlur={() => { onUpdate(item.id, editName); setEditingId(null); }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ) : (
                    <>
                      <span className="item-name">{item.name}</span>
                      <div className="item-actions">
                        <button className="action-btn edit" type="button" title="Editar"
                          onClick={(e) => { e.stopPropagation(); setEditName(item.name); setEditingId(item.id); }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        
                        <button className="action-btn delete" type="button" title="Excluir"
                          onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {search && !exactMatch && (
                <div className="dropdown-item create-item" onClick={() => onCreate(search).then(() => setSearch(''))}>
                  Criar "{search}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}