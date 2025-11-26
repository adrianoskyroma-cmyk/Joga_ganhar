#!/bin/bash

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   🚀 Push para GitHub - Jogar Ganhar   ║"
echo "╔════════════════════════════════════════╗"
echo -e "${NC}"
echo ""

cd /app

# Verificar se git está configurado
echo -e "${YELLOW}📋 Verificando configuração do Git...${NC}"
GIT_USER=$(git config --global user.name)
GIT_EMAIL=$(git config --global user.email)

if [ -z "$GIT_USER" ] || [ -z "$GIT_EMAIL" ]; then
    echo -e "${RED}❌ Git não está configurado!${NC}"
    echo ""
    echo "Configure suas credenciais:"
    echo "  git config --global user.name \"Seu Nome\""
    echo "  git config --global user.email \"seu@email.com\""
    echo ""
    read -p "Digite seu nome: " nome
    read -p "Digite seu email: " email
    
    git config --global user.name "$nome"
    git config --global user.email "$email"
    echo -e "${GREEN}✓ Git configurado!${NC}"
else
    echo -e "${GREEN}✓ Git já configurado${NC}"
    echo "  Nome: $GIT_USER"
    echo "  Email: $GIT_EMAIL"
fi

echo ""
echo -e "${BLUE}══════════════════════════════════════════${NC}"
echo -e "${YELLOW}Escolha uma opção:${NC}"
echo ""
echo "1) 🆕 Criar NOVO repositório no GitHub (recomendado)"
echo "2) 🔗 Conectar a repositório EXISTENTE"
echo "3) 📖 Ver instruções manuais"
echo ""
read -p "Escolha (1/2/3): " opcao

case $opcao in
    1)
        echo ""
        echo -e "${YELLOW}🆕 Criando novo repositório...${NC}"
        echo ""
        
        # Verificar autenticação do GitHub CLI
        if ! gh auth status &>/dev/null; then
            echo -e "${YELLOW}📝 Você precisa fazer login no GitHub${NC}"
            echo ""
            echo "Escolha o método de login:"
            echo "1) Browser (abre navegador)"
            echo "2) Token (você cola um token)"
            echo ""
            read -p "Método (1/2): " metodo
            
            if [ "$metodo" = "1" ]; then
                gh auth login -w
            else
                echo ""
                echo "Gere um token em: https://github.com/settings/tokens"
                echo "Marque: repo, workflow"
                gh auth login -w
            fi
        fi
        
        echo ""
        read -p "Nome do repositório [jogar-ganhar]: " repo_name
        repo_name=${repo_name:-jogar-ganhar}
        
        echo ""
        echo "Visibilidade:"
        echo "1) Público (recomendado - GitHub Actions grátis)"
        echo "2) Privado"
        read -p "Escolha (1/2): " visibilidade
        
        if [ "$visibilidade" = "2" ]; then
            vis_flag="--private"
        else
            vis_flag="--public"
        fi
        
        echo ""
        echo -e "${YELLOW}Criando repositório '$repo_name'...${NC}"
        
        gh repo create "$repo_name" $vis_flag --source=. --description="App de mini-jogos com recompensas em dinheiro real - Jogar Ganhar" --push
        
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✅ Repositório criado e código enviado!${NC}"
            echo ""
            REPO_URL=$(gh repo view --json url -q .url)
            echo -e "🌐 URL: ${BLUE}$REPO_URL${NC}"
            echo ""
            echo -e "${YELLOW}Próximos passos:${NC}"
            echo "1. Acesse: $REPO_URL/actions"
            echo "2. Clique em 'I understand my workflows, go ahead and enable them'"
            echo "3. Clique em 'Build APK' → 'Run workflow'"
            echo "4. Aguarde 10 minutos"
            echo "5. Baixe o APK em 'Artifacts'"
        else
            echo -e "${RED}❌ Erro ao criar repositório!${NC}"
            echo "Tente criar manualmente em: https://github.com/new"
        fi
        ;;
        
    2)
        echo ""
        echo -e "${YELLOW}🔗 Conectar a repositório existente${NC}"
        echo ""
        read -p "Cole a URL do repositório (ex: https://github.com/user/repo.git): " repo_url
        
        if [ -z "$repo_url" ]; then
            echo -e "${RED}❌ URL vazia!${NC}"
            exit 1
        fi
        
        # Verificar se já existe remote
        if git remote | grep -q "origin"; then
            echo -e "${YELLOW}⚠️  Remote 'origin' já existe. Removendo...${NC}"
            git remote remove origin
        fi
        
        echo -e "${YELLOW}Adicionando remote...${NC}"
        git remote add origin "$repo_url"
        
        echo -e "${YELLOW}Fazendo push...${NC}"
        git branch -M main
        git push -u origin main
        
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✅ Código enviado com sucesso!${NC}"
            echo ""
            echo -e "🌐 URL: ${BLUE}$repo_url${NC}"
            echo ""
            echo -e "${YELLOW}Próximos passos:${NC}"
            echo "1. Acesse seu repositório no GitHub"
            echo "2. Vá em 'Actions' e ative os workflows"
            echo "3. Execute 'Build APK'"
            echo "4. Baixe o APK gerado"
        else
            echo ""
            echo -e "${RED}❌ Erro no push!${NC}"
            echo ""
            echo "Possíveis soluções:"
            echo "1. Verifique se a URL está correta"
            echo "2. Configure credenciais:"
            echo "   gh auth login"
            echo "3. Ou use Personal Access Token"
        fi
        ;;
        
    3)
        echo ""
        echo -e "${BLUE}📖 Instruções Manuais:${NC}"
        echo ""
        echo "1. Crie repositório: https://github.com/new"
        echo ""
        echo "2. Configure credenciais:"
        echo "   git config --global user.name \"Seu Nome\""
        echo "   git config --global user.email \"seu@email.com\""
        echo ""
        echo "3. Conecte ao repositório:"
        echo "   git remote add origin https://github.com/SEU_USUARIO/jogar-ganhar.git"
        echo ""
        echo "4. Faça push:"
        echo "   git branch -M main"
        echo "   git push -u origin main"
        echo ""
        echo "5. Ative GitHub Actions:"
        echo "   - Acesse: seu-repo/actions"
        echo "   - Clique: 'Enable workflows'"
        echo ""
        echo "6. Execute build:"
        echo "   - Actions → Build APK → Run workflow"
        echo ""
        echo -e "${YELLOW}Documentação completa em:${NC} /app/GUIA_GITHUB_PUSH.md"
        ;;
        
    *)
        echo -e "${RED}Opção inválida!${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            ✅ Concluído!                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
