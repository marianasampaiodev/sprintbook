import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import Login from './Login.jsx';
import App from './App';

// Decide qual tela mostrar: login ou o app
export default function Root() {
  const [session, setSession] = useState(undefined); // undefined = verificando | null = deslogado

  useEffect(() => {
    // Sessão que já existe (o login fica guardado no navegador)
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    // Avisa quando entrar ou sair
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <div className="wrap"><div className="empty">Carregando…</div></div>;
  if (!session) return <Login />;
  return <App user={session.user} onLogout={() => supabase.auth.signOut()} />;
}