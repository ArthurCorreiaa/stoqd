import { useState } from 'react';
import { api } from '../api';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      window.location.href = '/dashboard';
    } catch (err) {
      setError('E-mail ou senha incorretos. Acesso negado.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card base-card">
        
        <div className="login-header">
          <span className="brand-symbol">✦</span>
          <h1 className="brand-name">stoqd</h1>
          <p>Acesso restrito à administração.</p>
        </div>

        <form 
          className="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }} 
        >
          
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label>E-mail</label>
            <input 
              type="email" 
              className="input-standard" 
              placeholder="exemplo@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input 
              type="password" 
              className="input-standard" 
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary login-btn">
            Entrar no Sistema
          </button>

        </form>
        
        <div className="login-footer">
          Não tem acesso? <a href="/">Voltar para a Vitrine</a>
        </div>

      </div>
    </div>
  );
}