
Instale as dependências e inicie o Vite:

```sh
npm install
npm run dev
```

As imagens anexadas às tasks são convertidas para JPEG e reduzidas para no máximo 800 px no lado maior antes de serem salvas.

## Autenticação por e-mail

Habilite o provedor **Email** em **Authentication → Sign In / Providers** no Supabase.

Se quiser permitir que novos usuários entrem imediatamente sem confirmar o endereço, desative **Confirm email** nas configurações do provedor. Nesse caso, o e-mail não é verificado.
