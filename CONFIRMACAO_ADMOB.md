# ✅ Confirmação: IDs do AdMob Configurados

## 📱 Status Atual dos Anúncios

### ⚠️ IMPORTANTE: Web App vs APK Nativo

**Situação Atual:**
- ✅ IDs do AdMob estão **DOCUMENTADOS** no projeto
- ⚠️ IDs estão **PLACEHOLDER** no código (não integrados)
- 🔴 AdMob SDK **NÃO está integrado** (apenas simulação)

**Por quê?**
O app atual é um **Web App** (React rodando no navegador). Para os anúncios do AdMob funcionarem de verdade, você precisa:
1. Gerar o APK (via GitHub Actions - conforme instruções)
2. Integrar o plugin nativo do AdMob no Capacitor

---

## 🔑 SEUS IDS DO ADMOB (Confirmados)

### ✅ IDs Fornecidos:

```
App ID:        ca-app-pub-1117855481975276~7365411747
Banner:        ca-app-pub-1117855481975276/2635829244
Interstitial:  ca-app-pub-1117855481975276/6364865851
Rewarded:      ca-app-pub-1117855481975276/5027733451
```

---

## 📂 Onde os IDs Estão Documentados:

### 1. README Principal
- **Arquivo**: `/app/README_JOGAR_GANHAR.md`
- **Linha**: 68-72
- **Status**: ✅ Documentado

### 2. Guia de Geração de APK
- **Arquivo**: `/app/COMO_GERAR_APK.md`
- **Linha**: 332-336
- **Status**: ✅ Documentado com exemplo de código

### 3. Componente AdBanner (Placeholder)
- **Arquivo**: `/app/frontend/src/components/AdBanner.jsx`
- **Linha**: 9
- **Status**: ⚠️ Apenas exibe ID como texto (simulação)

### 4. AndroidManifest.xml
- **Arquivo**: `/app/frontend/android/app/src/main/AndroidManifest.xml`
- **Status**: 🔴 **NÃO configurado ainda** (veja seção abaixo)

---

## 🚀 O Que Falta Para os Anúncios Funcionarem?

### Passo 1: Adicionar App ID no AndroidManifest.xml

**Onde**: `/app/frontend/android/app/src/main/AndroidManifest.xml`

**O que adicionar** (dentro da tag `<application>`):

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-1117855481975276~7365411747"/>
```

**Posição exata**:
```xml
<application
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:supportsRtl="true"
    android:theme="@style/AppTheme">

    <!-- ADICIONE AQUI -->
    <meta-data
        android:name="com.google.android.gms.ads.APPLICATION_ID"
        android:value="ca-app-pub-1117855481975276~7365411747"/>
    
    <activity ...>
    ...
</application>
```

---

### Passo 2: Instalar Plugin do AdMob

**Comandos**:
```bash
cd /app/frontend
npm install @capacitor-community/admob
npx cap sync android
```

---

### Passo 3: Integrar AdMob no Código React

#### 3.1 Inicializar AdMob (App.js)

```javascript
import { AdMob } from '@capacitor-community/admob';

// No início do App
useEffect(() => {
  async function initAdMob() {
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      initializeForTesting: false // true para teste
    });
  }
  initAdMob();
}, []);
```

#### 3.2 Banner Ads (AdBanner.jsx)

**Substitua o arquivo** `/app/frontend/src/components/AdBanner.jsx`:

```javascript
import React, { useEffect } from 'react';
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

export default function AdBanner() {
  useEffect(() => {
    async function showBanner() {
      try {
        await AdMob.showBanner({
          adId: 'ca-app-pub-1117855481975276/2635829244',
          adSize: BannerAdSize.BANNER,
          position: BannerAdPosition.TOP_CENTER,
        });
      } catch (error) {
        console.error('Banner ad error:', error);
      }
    }

    showBanner();

    return () => {
      AdMob.removeBanner();
    };
  }, []);

  return <div className="admob-banner-placeholder" />;
}
```

#### 3.3 Rewarded Ads (GamePlayPage.jsx)

**No método `watchRewardedAd`**, substitua a simulação por:

```javascript
const watchRewardedAd = async () => {
  try {
    // Preparar anúncio
    await AdMob.prepareRewardVideoAd({
      adId: 'ca-app-pub-1117855481975276/5027733451',
    });

    // Mostrar anúncio
    const result = await AdMob.showRewardVideoAd();
    
    // Se assistiu completo
    if (result.rewarded) {
      const completeResponse = await axios.post(`${API}/ads/complete`, {
        user_id: user.id,
        ad_type: 'rewarded',
        game_id: gameId,
        session_play_time: sessionTime
      });

      if (completeResponse.data.reward_granted) {
        toast.success(`+${completeResponse.data.coins_earned} moedas!`);
      }
    }
    
    setShowRewardedAd(false);
  } catch (error) {
    console.error('Rewarded ad error:', error);
    toast.error('Erro ao exibir anúncio');
  }
};
```

#### 3.4 Interstitial Ads (GamePlayPage.jsx)

**No método `watchEntryAd`**, substitua por:

```javascript
const watchEntryAd = async () => {
  try {
    await AdMob.prepareInterstitial({
      adId: 'ca-app-pub-1117855481975276/6364865851',
    });

    await AdMob.showInterstitial();
    
    const completeResponse = await axios.post(`${API}/ads/complete`, {
      user_id: user.id,
      ad_type: 'interstitial',
      game_id: gameId
    });

    if (completeResponse.data.reward_granted) {
      toast.success(`+R$ ${completeResponse.data.money_earned.toFixed(2)}`);
    }

    setShowEntryAd(false);
    startGameSession();
  } catch (error) {
    console.error('Interstitial ad error:', error);
    toast.error('Erro ao processar anúncio');
  }
};
```

---

## 🧪 Testar com IDs de Teste

Para testar **ANTES** de usar seus IDs reais:

### IDs de Teste do Google:

```javascript
// Banner Test ID
adId: 'ca-app-pub-3940256099942544/9214589741'

// Interstitial Test ID  
adId: 'ca-app-pub-3940256099942544/1033173712'

// Rewarded Test ID
adId: 'ca-app-pub-3940256099942544/5224354917'
```

**Como usar**:
1. Substitua temporariamente seus IDs pelos IDs de teste
2. Gere o APK
3. Teste no celular
4. Depois volte para seus IDs reais

---

## 📋 Checklist de Integração do AdMob

### Backend (✅ Pronto):
- [x] Sistema de limites (15/hora, 80/dia)
- [x] Rolling window implementado
- [x] Bônus de R$ 0,50 primeiros 5 anúncios
- [x] Sistema de recompensas (200 moedas padrão)
- [x] Endpoint /ads/request (verifica limites)
- [x] Endpoint /ads/complete (credita moedas)
- [x] Cooldown de 45 segundos
- [x] Comportamento quando limite atingido

### Frontend Web (✅ Simulação Pronta):
- [x] Componente AdBanner (placeholder)
- [x] Modais de anúncios (UI)
- [x] Fluxo de 5 anúncios diários obrigatórios
- [x] Fluxo de 1 anúncio ao entrar no jogo
- [x] Cronômetro de cooldown
- [x] Integração com backend

### APK Android (⚠️ Pendente):
- [ ] **App ID no AndroidManifest.xml**
- [ ] **Plugin @capacitor-community/admob instalado**
- [ ] **AdMob.initialize() no código**
- [ ] **Banner real implementado**
- [ ] **Rewarded ads reais implementados**
- [ ] **Interstitial ads reais implementados**
- [ ] **Testado com IDs de teste**
- [ ] **Testado com IDs reais**
- [ ] **APK gerado e instalado no celular**

---

## ⚡ Como Integrar AGORA (Passo-a-Passo Rápido)

### 1. Adicionar App ID ao AndroidManifest:

```bash
# Edite o arquivo manualmente no GitHub ou localmente
# Arquivo: /app/frontend/android/app/src/main/AndroidManifest.xml
# Adicione a meta-data conforme mostrado acima
```

### 2. Instalar Plugin:

```bash
cd /app/frontend
npm install @capacitor-community/admob
npx cap sync android
git add .
git commit -m "Add AdMob integration"
git push
```

### 3. Atualizar Código React:

- Copie os exemplos acima para os arquivos correspondentes
- Commit e push

### 4. Gerar APK:

- GitHub Actions → Build APK → Run workflow
- Aguardar 10 minutos
- Baixar APK
- Instalar no celular

### 5. Testar:

- Abrir app
- Verificar se banner aparece no topo
- Assistir anúncios recompensados
- Confirmar se moedas são creditadas

---

## 📊 Resumo Final

### ✅ O Que Está OK:

1. **IDs do AdMob**: Todos documentados corretamente
2. **Backend**: 100% pronto para receber callbacks
3. **Frontend UI**: Fluxos e modais prontos
4. **Lógica de Negócio**: Limites, bônus, cooldowns implementados
5. **APK Base**: Configurado com Capacitor

### ⚠️ O Que Falta:

1. **App ID no AndroidManifest.xml** (5 minutos)
2. **Plugin do AdMob** (10 minutos)
3. **Integração do SDK** nos componentes (30 minutos)
4. **Build e teste** (15 minutos)

**Tempo total para integrar**: ~1 hora

---

## 🎯 Seus IDs Estão Corretos?

Para verificar se seus IDs estão corretos:

1. **Acesse**: https://apps.admob.com/
2. **Vá em**: Apps → Seu app → Ad units
3. **Compare** os IDs que aparecem lá com os que forneceu:
   - App ID: `ca-app-pub-1117855481975276~7365411747`
   - Banner: `ca-app-pub-1117855481975276/2635829244`
   - Interstitial: `ca-app-pub-1117855481975276/6364865851`
   - Rewarded: `ca-app-pub-1117855481975276/5027733451`

Se baterem 100%, está tudo certo! ✅

---

## 📞 Próximos Passos Recomendados

1. **Adicione o App ID** no AndroidManifest.xml
2. **Instale o plugin** @capacitor-community/admob
3. **Faça push** para o GitHub
4. **Gere o APK** via Actions
5. **Teste** no celular

Ou

**Deixe como está** (simulação) e gere o APK para testar primeiro. Depois você adiciona a integração real do AdMob.

---

## ✅ CONFIRMAÇÃO FINAL

**Seus IDs do AdMob estão:**
- ✅ Corretos (formato válido)
- ✅ Documentados no projeto
- ✅ Prontos para uso
- ⚠️ **Falta apenas integrar o SDK nativo**

**Para os anúncios funcionarem de verdade no APK, siga os 5 passos acima!** 🚀
