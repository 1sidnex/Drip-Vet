# 🚀 Guia de Deploy no Netlify - DripVet

## ⚠️ Problema: Página em Branco

Se sua página está em branco no Netlify, siga estes passos:

---

## 📋 Passo 1: Configurar Variáveis de Ambiente no Netlify

1. **Acesse o painel do Netlify:**
   - Faça login em https://app.netlify.com
   - Selecione seu site

2. **Vá em Site settings > Environment variables**

3. **Adicione as seguintes variáveis:**

   ```
   VITE_SUPABASE_URL = sua_url_do_supabase
   VITE_SUPABASE_KEY = sua_chave_do_supabase
   ```

4. **Clique em "Save"**

---

## 📋 Passo 2: Configurar Build Settings

No painel do Netlify, vá em **Site settings > Build & deploy**:

### Build command:

```
npm install && npm run build
```

### Publish directory:

```
dist/spa
```

---

## 📋 Passo 3: Verificar Configuração

O arquivo `netlify.toml` já foi criado na raiz do projeto com as configurações corretas.

---

## 🔍 Verificar se Está Funcionando

1. **Faça um novo deploy:**
   - Vá em **Deploys**
   - Clique em **Trigger deploy > Deploy site**

2. **Abra o console do navegador (F12):**
   - Verifique se há erros
   - Procure por mensagens sobre variáveis de ambiente

3. **Verifique os logs do build:**
   - No Netlify, vá em **Deploys**
   - Clique no deploy mais recente
   - Verifique se o build foi bem-sucedido

---

## ❗ Problemas Comuns

### Página completamente em branco

- **Causa:** Variáveis de ambiente não configuradas
- **Solução:** Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_KEY` no Netlify

### Erro 404 em rotas

- **Causa:** Configuração de redirects incorreta
- **Solução:** O arquivo `netlify.toml` já está configurado corretamente

### Build falha

- **Causa:** Comando de build incorreto
- **Solução:** Use `npm install && npm run build`

### Assets não carregam

- **Causa:** Caminho base incorreto
- **Solução:** O projeto usa modo hash (`vueRouterMode: 'hash'`), então não precisa de caminho base

---

## 📝 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] Build command: `npm install && npm run build`
- [ ] Publish directory: `dist/spa`
- [ ] Arquivo `netlify.toml` na raiz do projeto
- [ ] Deploy realizado com sucesso
- [ ] Console do navegador sem erros críticos

---

## 🔗 Links Úteis

- **Netlify Dashboard:** https://app.netlify.com
- **Documentação Netlify:** https://docs.netlify.com
- **Quasar Deploy Guide:** https://quasar.dev/quasar-cli-vite/building-for-production#deploying

---

## 💡 Dica

Se ainda estiver com problemas, verifique:

1. Os logs do build no Netlify
2. O console do navegador (F12)
3. A Network tab para ver se os arquivos estão carregando
