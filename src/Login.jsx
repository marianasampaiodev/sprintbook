import { useState } from 'react';
import { supabase } from './supabase';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setMsg('');
    setBusy(true);
    try {
      const { data, error } = mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      if (error) setMsg(error.message);
      else if (mode === 'signup' && !data.session) {
        setMsg('Conta criada! Confirme pelo e-mail e depois entre.');
      }
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Não foi possível concluir a autenticação.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-intro">
          <div className="brand-lockup auth-brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="m8 5-6 7 6 7M16 5l6 7-6 7" /></svg>
            </span>
            <span className="brand">Sprintbook</span>
          </div>
          <div className="auth-message-block">
            <span className="auth-kicker">PLANEJE COM LEVEZA</span>
            <h1>Um passo de cada vez.<br /><span>Uma sprint por vez.</span></h1>
            <p>Organize suas tarefas, acompanhe o progresso e celebre cada entrega.</p>
            <div className="auth-highlights">
              <span><i aria-hidden="true">✓</i> Quadro visual por etapas</span>
              <span><i aria-hidden="true">✓</i> Prioridades sempre claras</span>
              <span><i aria-hidden="true">✓</i> Seu progresso em um só lugar</span>
            </div>
          </div>
          <span className="auth-decoration auth-decoration-one" />
          <span className="auth-decoration auth-decoration-two" />
        </div>

        <form className="auth-form" onSubmit={submit}>
          <span className="eyebrow">{mode === 'login' ? 'BEM-VINDO AO SPRINTBOOK' : 'VAMOS COMEÇAR'}</span>
          <h2>{mode === 'login' ? 'Entrar na sua conta' : 'Criar sua conta'}</h2>
          <p className="auth-form-copy">
            {mode === 'login' ? 'Acesse seu espaço de organização.' : 'Crie uma conta para começar a planejar.'}
          </p>
          <label htmlFor="login-email">E-mail</label>
          <input id="login-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <label htmlFor="login-password">Senha</label>
          <input id="login-password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Mínimo de 6 caracteres" />
          {msg && <div className="auth-alert" role="status">{msg}</div>}
          <button className="btn pri auth-submit" disabled={busy}>
            {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            {!busy && <span aria-hidden="true">→</span>}
          </button>
          <button
            type="button"
            className="auth-switch"
            disabled={busy}
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setMsg('');
            }}
          >
            {mode === 'login' ? 'Ainda não tem uma conta? Criar conta' : 'Já tem uma conta? Entrar'}
          </button>
          <p className="auth-footnote">Seu espaço de trabalho, sempre sincronizado.</p>
        </form>
      </section>
    </main>
  );
}