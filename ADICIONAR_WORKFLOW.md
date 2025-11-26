# 🚀 Como Adicionar o Workflow para Build APK

## ✅ Código já está no GitHub!

**Seu repositório**: https://github.com/adrianoskyroma-cmyk/Joga_ganhar

---

## 📝 Adicionar Workflow Manualmente (2 minutos)

### Passo 1: Acesse o Repositório

1. Vá em: **https://github.com/adrianoskyroma-cmyk/Joga_ganhar**

---

### Passo 2: Criar Arquivo do Workflow

1. **Clique** no botão **"Add file"** (lado direito)
2. **Selecione** "Create new file"
3. **Nome do arquivo**: `.github/workflows/build-apk.yml`
4. **Cole este conteúdo**:

```yaml
name: Build APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '17'
        
    - name: Install dependencies
      run: |
        cd frontend
        yarn install
        
    - name: Build React App
      run: |
        cd frontend
        GENERATE_SOURCEMAP=false yarn build
        
    - name: Sync Capacitor
      run: |
        cd frontend
        npx cap sync android
        
    - name: Build APK
      run: |
        cd frontend/android
        chmod +x gradlew
        ./gradlew assembleDebug
        
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: jogar-ganhar-apk
        path: frontend/android/app/build/outputs/apk/debug/app-debug.apk
        
    - name: Create Release
      uses: softprops/action-gh-release@v1
      if: startsWith(github.ref, 'refs/tags/')
      with:
        files: frontend/android/app/build/outputs/apk/debug/app-debug.apk
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

5. **Role até o final** da página

6. **Commit message**: `Add GitHub Actions workflow for APK build`

7. **Clique** no botão verde **"Commit new file"**

---

### Passo 3: Ativar GitHub Actions

1. **Clique** na aba **"Actions"** (no topo)

2. Se aparecer mensagem "Workflows aren't being run", clique em:
   **"I understand my workflows, go ahead and enable them"**

3. Pronto! GitHub Actions ativado ✅

---

### Passo 4: Executar o Build (Gerar APK)

1. Na aba **Actions**, clique em **"Build APK"** (lado esquerdo)

2. **Clique** no botão **"Run workflow"** (lado direito, azul)

3. **Selecione** branch: `main`

4. **Clique** em **"Run workflow"** (verde)

5. **Aguarde** 8-12 minutos ⏱️

---

### Passo 5: Baixar o APK

1. Quando o build ficar **verde** ✅

2. **Clique** no workflow concluído

3. **Role até** a seção **"Artifacts"**

4. **Clique** em **"jogar-ganhar-apk"**

5. Um arquivo **ZIP será baixado**

6. **Descompacte** o ZIP

7. Dentro tem: **`app-debug.apk`** 🎉

---

## 📱 Instalar no Celular

1. **Transfira** o APK para o celular (WhatsApp, Drive, Email, USB)

2. **Abra** o arquivo no celular

3. **Ative** "Instalar de fontes desconhecidas" se pedir

4. **Instale** o app

5. **Pronto!** 🎉

---

## 🔄 Builds Automáticos

Depois que adicionar o workflow:

- **Qualquer push** no branch `main` vai gerar APK automaticamente!
- Ou execute manualmente: Actions → Build APK → Run workflow

---

## 📞 Links Úteis

- **Seu repositório**: https://github.com/adrianoskyroma-cmyk/Joga_ganhar
- **Actions**: https://github.com/adrianoskyroma-cmyk/Joga_ganhar/actions
- **Criar workflow**: https://github.com/adrianoskyroma-cmyk/Joga_ganhar/new/main

---

## ⚡ Atalho Rápido

**Link direto para criar o arquivo**:
https://github.com/adrianoskyroma-cmyk/Joga_ganhar/new/main?filename=.github/workflows/build-apk.yml

Cole o código YAML acima e commit! 🚀
