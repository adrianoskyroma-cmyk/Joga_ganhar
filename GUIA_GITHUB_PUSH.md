# 📤 Guia Completo: Push para GitHub e Gerar APK

## 🎯 Objetivo
Enviar seu código para o GitHub e configurar build automático de APK

---

## PARTE 1: Criar Conta e Repositório no GitHub

### Passo 1: Criar Conta no GitHub (se não tiver)

1. Acesse: **https://github.com/join**
2. Preencha:
   - Username (ex: `joaosilva`)
   - Email
   - Senha
3. Clique em **"Create account"**
4. Verifique seu email
5. Pronto! Conta criada ✅

---

### Passo 2: Criar um Novo Repositório

1. **Acesse**: https://github.com/new
   
2. **Preencha**:
   - **Repository name**: `jogar-ganhar` (ou outro nome)
   - **Description**: `App de mini-jogos com recompensas em dinheiro real`
   - **Visibilidade**: 
     - ✅ **Public** (recomendado - permite GitHub Actions grátis)
     - 🔒 Private (se quiser privado)
   
3. **NÃO marque** nenhuma opção de:
   - [ ] Add a README file
   - [ ] Add .gitignore
   - [ ] Choose a license
   
   (Deixe tudo desmarcado!)

4. Clique em **"Create repository"**

5. **Copie a URL** que aparece (algo como):
   ```
   https://github.com/SEU_USUARIO/jogar-ganhar.git
   ```

---

## PARTE 2: Conectar Projeto ao GitHub

### Opção A: Via Interface Web do Emergent (Mais Fácil)

**Se o Emergent tiver botão de GitHub:**

1. Procure por:
   - 🔗 "Connect to GitHub"
   - 📤 "Push to GitHub"  
   - ⚙️ "Settings" → "GitHub Integration"

2. Clique e siga as instruções na tela

3. Cole a URL do seu repositório quando pedir

4. Pronto! ✅

---

### Opção B: Via Linha de Comando (Manual)

**Se não tiver integração no Emergent, use estes comandos:**

#### 1. Configure seu nome e email no Git:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

#### 2. Conecte ao repositório GitHub:

**Substitua** `SEU_USUARIO` e `jogar-ganhar` pelos seus valores:

```bash
cd /app
git remote add origin https://github.com/SEU_USUARIO/jogar-ganhar.git
```

#### 3. Verifique se conectou:

```bash
git remote -v
```

Deve aparecer:
```
origin  https://github.com/SEU_USUARIO/jogar-ganhar.git (fetch)
origin  https://github.com/SEU_USUARIO/jogar-ganhar.git (push)
```

#### 4. Faça o Push:

```bash
git branch -M main
git push -u origin main
```

#### 5. **Autenticação**:

Quando pedir senha, você tem 2 opções:

**Opção 1 - Personal Access Token (Recomendado):**

1. Acesse: https://github.com/settings/tokens
2. Clique: **"Generate new token"** → **"Generate new token (classic)"**
3. Configure:
   - Note: `Emergent Jogar Ganhar`
   - Expiration: `No expiration` (ou 90 days)
   - Scopes: Marque:
     - ✅ `repo` (todos)
     - ✅ `workflow`
4. Clique: **"Generate token"**
5. **COPIE O TOKEN** (só aparece uma vez!)
   - Exemplo: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
6. Use este token como senha quando o Git pedir

**Opção 2 - GitHub CLI:**

```bash
# Instalar GitHub CLI (se não tiver)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Autenticar
gh auth login

# Push
git push -u origin main
```

---

## PARTE 3: Ativar GitHub Actions e Gerar APK

### Passo 1: Acesse seu Repositório

1. Vá em: `https://github.com/SEU_USUARIO/jogar-ganhar`
2. Você verá seus arquivos lá! 🎉

---

### Passo 2: Ativar GitHub Actions

1. **Clique na aba** "⚡ **Actions**" (no topo da página)

2. Você verá uma mensagem:
   ```
   Workflows aren't being run on this repository
   ```

3. **Clique no botão verde**: **"I understand my workflows, go ahead and enable them"**

4. Pronto! Actions ativado ✅

---

### Passo 3: Executar o Workflow (Gerar APK)

#### Opção 1 - Automático (Qualquer commit dispara):

Qualquer push novo vai gerar o APK automaticamente!

```bash
cd /app
git add .
git commit -m "Update app"
git push
```

#### Opção 2 - Manual (Dispare quando quiser):

1. **Vá em**: Actions → **"Build APK"** (no lado esquerdo)

2. **Clique** no botão: **"Run workflow"** (lado direito, azul)

3. **Selecione**:
   - Branch: `main`
   
4. **Clique**: **"Run workflow"** (verde)

5. **Aguarde** aparecer o workflow na lista (atualiza em 5 segundos)

---

### Passo 4: Acompanhar o Build

1. **Clique** no workflow que apareceu (ex: "feat: Adiciona configuração...")

2. Você verá:
   - 🟡 **Amarelo** (rodando) - Aguarde...
   - ✅ **Verde** (sucesso) - Pronto!
   - ❌ **Vermelho** (erro) - Clique para ver logs

3. **Tempo estimado**: 8-12 minutos

---

### Passo 5: Baixar o APK

1. **Quando ficar verde** ✅, role a página até o final

2. Procure a seção: **📦 "Artifacts"**

3. **Clique** em: **"jogar-ganhar-apk"**

4. Um arquivo ZIP será baixado (ex: `jogar-ganhar-apk.zip`)

5. **Descompacte** o ZIP

6. Dentro tem o: **`app-debug.apk`** 🎉

---

## PARTE 4: Instalar o APK no Celular

### Via Transferência Direta:

1. **Transfira** o `app-debug.apk` para o celular:
   - WhatsApp (envie para você mesmo)
   - Email
   - Google Drive
   - USB (se tiver computador)

2. **No celular**, abra o arquivo

3. Se aparecer aviso de "Fonte desconhecida":
   - Toque em **"Configurações"**
   - Ative **"Permitir desta fonte"**
   - Volte e toque novamente no APK

4. **Toque em** "Instalar"

5. **Aguarde** a instalação

6. **Toque em** "Abrir"

7. **Pronto!** App instalado! 🎉

---

## PARTE 5: Atualizações Futuras

### Quando quiser atualizar o app:

1. **Faça as mudanças** no código

2. **Commit e Push**:
   ```bash
   cd /app
   git add .
   git commit -m "Descrição da mudança"
   git push
   ```

3. **APK será gerado automaticamente!**

4. **Baixe** o novo APK em: Actions → Artifacts

5. **Instale** por cima do antigo (atualiza automaticamente)

---

## 🎯 RESUMO RÁPIDO (Passo-a-Passo Mínimo)

### Setup Inicial (Uma vez só):

1. ✅ Criar conta GitHub: https://github.com/join
2. ✅ Criar repositório: https://github.com/new
3. ✅ Conectar projeto:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/jogar-ganhar.git
   git push -u origin main
   ```
4. ✅ Ativar Actions no GitHub

### Para Gerar APK (Sempre que quiser):

1. GitHub → Actions → Build APK → **Run workflow**
2. Aguardar 10 minutos
3. Baixar em Artifacts
4. Instalar no celular

---

## 🔧 Solução de Problemas

### Erro: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/jogar-ganhar.git
```

---

### Erro: "Authentication failed"

**Solução**: Use Personal Access Token ao invés de senha

1. Gere o token: https://github.com/settings/tokens
2. Use o token como senha

---

### Erro: "Permission denied"

**Solução**: Configure credenciais

```bash
git config --global credential.helper store
git push
# Digite: username + token
```

---

### Build Failed no GitHub Actions

1. Clique no workflow com erro
2. Clique no job "build"
3. Veja qual step falhou
4. Leia o log de erro
5. Se for problema de dependência, adicione no workflow

---

## 📱 Comandos Prontos (Copiar e Colar)

### Setup Completo (substitua SEU_USUARIO):

```bash
# 1. Configurar Git
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# 2. Conectar ao GitHub
cd /app
git remote add origin https://github.com/SEU_USUARIO/jogar-ganhar.git

# 3. Push
git branch -M main
git push -u origin main
```

---

## 🎉 PRONTO!

Agora você tem:
- ✅ Código no GitHub
- ✅ Build automático de APK
- ✅ APK pronto para baixar e instalar

**Qualquer dúvida, consulte este guia!** 📖

---

## 📞 Links Úteis

- Criar conta: https://github.com/join
- Criar repositório: https://github.com/new
- Personal Access Tokens: https://github.com/settings/tokens
- GitHub Actions Docs: https://docs.github.com/actions
- Seu repositório: https://github.com/SEU_USUARIO/jogar-ganhar
- Actions do seu repo: https://github.com/SEU_USUARIO/jogar-ganhar/actions

---

**Boa sorte! 🚀**
