import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import Login from './Login.jsx';
import App from './App';

// Decide qual tela mostrar: login ou o app
export default function Root() {
  const [session, setSession] = useState(undefined); // undefined = verificando | null = deslogado

  useEffect(() => {
    if (!supabase) return;

    // Sessão que já existe (o login fica guardado no navegador)
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    // Avisa quando entrar ou sair
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <div className="wrap">
        <h1 className="brand" style={{ marginBottom: 16 }}>Sprintbook</h1>
        <section className="panel">
          <h3>Configure o Supabase para iniciar</h3>
          <p>Crie um arquivo <code>.env.local</code> na pasta do projeto com estas variáveis:</p>
          <pre><code>{'VITE_SUPABASE_URL=https://seu-projeto.supabase.co\nVITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel'}</code></pre>
          <p>Salve o arquivo e reinicie o servidor de desenvolvimento.</p>
        </section>
      </div>
    );
  }

  if (session === undefined) return <div className="wrap"><div className="empty">Carregando…</div></div>;
  if (!session) return <Login />;
  return <App user={session.user} onLogout={() => supabase.auth.signOut()} />;
}