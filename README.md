
Instale as dependências e inicie o Vite:

```sh
npm install
npm run dev
```

Antes de iniciar, configure o Supabase criando um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel
```

Use a URL e a chave publicável do seu projeto Supabase. Se essas variáveis não estiverem configuradas, o app exibirá as instruções na tela. Reinicie o Vite após alterar o arquivo.

As imagens anexadas às tasks são convertidas para JPEG e reduzidas para no máximo 800 px no lado maior antes de serem salvas.

## Autenticação por e-mail

Habilite o provedor **Email** em **Authentication → Sign In / Providers** no Supabase.

Se quiser permitir que novos usuários entrem imediatamente sem confirmar o endereço, desative **Confirm email** nas configurações do provedor. Nesse caso, o e-mail não é verificado.
