# 🔧 Solução: Página em Branco no Netlify

## 🔍 Diagnóstico Passo a Passo

### **Passo 1: Verificar Console do Navegador**

1. Abra o site no Netlify: `https://dripvet.netlify.app`
2. Pressione **F12** para abrir o DevTools
3. Vá na aba **Console**
4. **Procure por erros em vermelho**

**Erros comuns:**

- `Failed to load resource` → Arquivos não estão sendo carregados
- `VITE_SUPABASE_URL is not defined` → Variáveis de ambiente não configuradas
- `Cannot read property` → Erro de JavaScript
- `404 Not Found` → Arquivos não encontrados

---

### **Passo 2: Verificar Variáveis de Ambiente no Netlify**

1. Acesse: https://app.netlify.com
2. Selecione seu site **dripvet**
3. Vá em **Site settings** (ícone de engrenagem)
4. Clique em **Environment variables**
5. **Verifique se existem estas variáveis:**
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_KEY
   ```

**Se não existirem:**

1. Clique em **Add a variable**
2. Adicione:
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** `sua_url_do_supabase` (ex: `https://xxxxx.supabase.co`)
3. Clique em **Add a variable** novamente
4. Adicione:
   - **Key:** `VITE_SUPABASE_KEY`
   - **Value:** `sua_chave_anon_publica`
5. Clique em **Save**

**⚠️ IMPORTANTE:** Após adicionar as variáveis, você **DEVE fazer um novo deploy!**

---

### **Passo 3: Verificar Configurações de Build**

No Netlify, vá em **Site settings > Build & deploy**:

**Build command:**

```
npm install && npm run build
```

**Publish directory:**

```
dist/spa
```

**Node version:**

- Use Node.js 18 ou superior
- No Netlify: **Site settings > Build & deploy > Environment > Node version**
- Selecione: `18` ou `20`

---

### **Passo 4: Verificar Logs do Build**

1. No Netlify, vá em **Deploys**
2. Clique no deploy mais recente
3. Verifique se o build foi **bem-sucedido** (verde)
4. Se houver erros (vermelho), clique para ver os detalhes

**Erros comuns no build:**

- `npm ERR!` → Problema com dependências
- `Cannot find module` → Dependência faltando
- `Build failed` → Erro no código

---

### **Passo 5: Verificar Arquivos Gerados**

Após o build bem-sucedido, verifique se os arquivos foram gerados:

1. No Netlify, vá em **Deploys**
2. Clique no deploy
3. Vá em **Published files**
4. **Verifique se existe:**
   - `index.html`
   - Pasta `assets/` com arquivos `.js` e `.css`

**Se não existirem:** O build não está gerando os arquivos corretamente.

---

## 🛠️ Soluções Específicas

### **Solução 1: Variáveis de Ambiente Não Configuradas**

**Sintoma:** Console mostra `VITE_SUPABASE_URL is not defined`

**Solução:**

1. Configure as variáveis no Netlify (Passo 2 acima)
2. Faça um novo deploy
3. Aguarde o build terminar
4. Recarregue a página

---

### **Solução 2: Build Falhando**

**Sintoma:** Deploy mostra erro vermelho

**Solução:**

1. Verifique os logs do build
2. Se houver erro de dependências, tente:
   ```
   Build command: npm ci && npm run build
   ```
3. Ou limpe o cache:
   - **Site settings > Build & deploy > Build settings**
   - Clique em **Clear cache and retry deploy**

---

### **Solução 3: Arquivos Não Carregando**

**Sintoma:** Console mostra `404` para arquivos `.js` ou `.css`

**Solução:**

1. Verifique se o **Publish directory** está correto: `dist/spa`
2. Verifique se o arquivo `netlify.toml` existe na raiz do projeto
3. Faça um novo deploy

---

### **Solução 4: Erro de JavaScript**

**Sintoma:** Console mostra erro de JavaScript

**Solução:**

1. Copie o erro completo do console
2. Verifique se há erros de sintaxe no código
3. Teste localmente primeiro: `npm run build` e `npm run dev`

---

## 📋 Checklist Completo

Marque cada item conforme verificar:

- [ ] Console do navegador verificado (F12)
- [ ] Variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_KEY` configuradas no Netlify
- [ ] Build command: `npm install && npm run build`
- [ ] Publish directory: `dist/spa`
- [ ] Node version: 18 ou superior
- [ ] Build bem-sucedido (verde no Netlify)
- [ ] Arquivo `index.html` existe nos arquivos publicados
- [ ] Arquivos `.js` e `.css` existem na pasta `assets/`
- [ ] Novo deploy feito após configurar variáveis
- [ ] Página recarregada após o deploy

---

## 🚀 Passos para Resolver Agora

1. **Abra o console do navegador** (F12) e veja qual erro aparece
2. **Configure as variáveis de ambiente** no Netlify (se ainda não fez)
3. **Faça um novo deploy** no Netlify
4. **Aguarde o build terminar**
5. **Recarregue a página** (Ctrl+F5 para limpar cache)

---

## 💡 Teste Local Primeiro

Antes de fazer deploy, teste localmente:

```bash
# 1. Configure o arquivo .env na raiz do projeto
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_KEY=sua_chave

# 2. Faça o build
npm run build

# 3. Teste o build localmente
npx serve dist/spa
```

Se funcionar localmente mas não no Netlify, o problema é nas configurações do Netlify.

---

## 🆘 Ainda Não Funciona?

Se após seguir todos os passos ainda não funcionar:

1. **Copie o erro completo do console** (F12)
2. **Copie os logs do build** do Netlify
3. **Verifique:**
   - URL do site está correta?
   - Build foi bem-sucedido?
   - Variáveis de ambiente estão configuradas?

---

## 📝 Informações Importantes

- O projeto usa **modo hash** (`vueRouterMode: 'hash'`), então não precisa de configuração especial de rotas
- O arquivo `netlify.toml` já está configurado corretamente
- As variáveis de ambiente **DEVEM** ter o prefixo `VITE_` para funcionar no Vite
