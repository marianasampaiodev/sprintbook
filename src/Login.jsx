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
    <div className="wrap" style={{ maxWidth: 420, paddingTop: 60 }}>
      <h1 className="brand" style={{ marginBottom: 16 }}>Sprintbook</h1>
      <form className="panel" onSubmit={submit}>
        <h3>{mode === 'login' ? 'Entrar' : 'Criar conta'}</h3>
        <label>E-mail</label>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
        <label>Senha (mínimo 6 caracteres)</label>
        <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
        {msg && <div style={{ color: 'var(--bad)', fontSize: 14, marginTop: 10 }}>{msg}</div>}
        <div className="row" style={{ marginTop: 16, justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setMsg('');
            }}
          >
            {mode === 'login' ? 'Criar conta' : 'Já tenho conta'}
          </button>
          <button className="btn pri" disabled={busy}>
            {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar'}
          </button>
        </div>
      </form>
    </div>
  );
}