#!/bin/bash

echo "======================================"
echo "   Jogar Ganhar - APK Builder"
echo "======================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Java
echo -e "${YELLOW}1. Verificando Java...${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java não encontrado!${NC}"
    echo "Instale Java 17:"
    echo "  sudo apt-get install openjdk-17-jdk"
    exit 1
fi
echo -e "${GREEN}✓ Java instalado${NC}"
java -version

# Verificar Android SDK
echo ""
echo -e "${YELLOW}2. Verificando Android SDK...${NC}"
if [ -z "$ANDROID_HOME" ]; then
    echo -e "${RED}❌ ANDROID_HOME não configurado!${NC}"
    echo ""
    echo "Configure o Android SDK:"
    echo "1. Baixe Android Studio: https://developer.android.com/studio"
    echo "2. Instale o Android SDK"
    echo "3. Configure as variáveis:"
    echo "   export ANDROID_HOME=\$HOME/Android/Sdk"
    echo "   export PATH=\$PATH:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools"
    echo ""
    echo "Ou crie o arquivo local.properties:"
    echo "   echo 'sdk.dir=/caminho/para/Android/Sdk' > /app/frontend/android/local.properties"
    exit 1
fi
echo -e "${GREEN}✓ ANDROID_HOME configurado: $ANDROID_HOME${NC}"

# Build React
echo ""
echo -e "${YELLOW}3. Fazendo build do React...${NC}"
cd /app/frontend
GENERATE_SOURCEMAP=false yarn build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build do React!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build React concluído${NC}"

# Sync Capacitor
echo ""
echo -e "${YELLOW}4. Sincronizando com Android...${NC}"
npx cap sync android
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao sincronizar!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Sync concluído${NC}"

# Build APK
echo ""
echo -e "${YELLOW}5. Construindo APK...${NC}"
cd /app/frontend/android
./gradlew assembleDebug
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao construir APK!${NC}"
    exit 1
fi

# Resultado
echo ""
echo -e "${GREEN}======================================"
echo "   ✅ APK GERADO COM SUCESSO!"
echo "======================================${NC}"
echo ""
echo "Localização:"
echo "  /app/frontend/android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "Para instalar no celular:"
echo "  adb install /app/frontend/android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "Tamanho do APK:"
ls -lh /app/frontend/android/app/build/outputs/apk/debug/app-debug.apk | awk '{print "  " $5}'
