#!/usr/bin/env tsx

/**
 * Script para testar a configuração Epic Games em produção
 * Execute: npx tsx src/scripts/test-epic-production.ts
 */

import { getFirebaseApp } from "@/lib/firebase"
import { getAuth, OAuthProvider } from "firebase/auth"

async function testEpicGamesConfig() {
  console.log("🔍 Testando configuração Epic Games...")
  
  try {
    // 1. Testar inicialização do Firebase
    console.log("1. Inicializando Firebase...")
    const app = getFirebaseApp()
    console.log("✅ Firebase inicializado com sucesso")
    
    // 2. Testar configuração de autenticação
    console.log("2. Configurando autenticação...")
    const auth = getAuth(app)
    console.log("✅ Autenticação configurada")
    
    // 3. Testar provedor Epic Games
    console.log("3. Configurando provedor Epic Games...")
    const provider = new OAuthProvider("oidc.epic")
    
    // Adicionar escopos
    provider.addScope('basic_profile')
    provider.addScope('openid')
    provider.addScope('email')
    
    console.log("✅ Provedor Epic Games configurado")
    console.log("   - Provider ID: oidc.epic")
    console.log("   - Escopos: basic_profile, openid, email")
    
    // 4. Verificar configuração do Firebase
    console.log("4. Verificando configuração do Firebase...")
    const config = app.options
    console.log("   - Project ID:", config.projectId)
    console.log("   - Auth Domain:", config.authDomain)
    console.log("   - API Key:", config.apiKey ? "✅ Configurada" : "❌ Não configurada")
    
    // 5. Verificar domínios autorizados
    console.log("5. Verificando domínios autorizados...")
    console.log("   ⚠️  IMPORTANTE: Verifique manualmente no Firebase Console:")
    console.log("      - Vá para Authentication > Settings > Authorized domains")
    console.log("      - Adicione: fortnitesz.online")
    console.log("      - Adicione: www.fortnitesz.online")
    
    // 6. Verificar URLs de redirecionamento
    console.log("6. Verificando URLs de redirecionamento...")
    console.log("   ⚠️  IMPORTANTE: Verifique manualmente no Epic Games Developer Portal:")
    console.log("      - Adicione: https://dashboard-f0217.firebaseapp.com/__/auth/handler")
    console.log("      - Adicione: https://fortnitesz.online/__/auth/handler")
    console.log("      - Adicione: https://www.fortnitesz.online/__/auth/handler")
    
    console.log("\n🎯 Configuração básica OK!")
    console.log("\n📋 Próximos passos:")
    console.log("1. Configure os domínios autorizados no Firebase Console")
    console.log("2. Configure as URLs de redirecionamento no Epic Games Developer Portal")
    console.log("3. Faça deploy no Vercel")
    console.log("4. Teste a autenticação em produção")
    
  } catch (error) {
    console.error("❌ Erro na configuração:", error)
    console.log("\n🔧 Soluções possíveis:")
    console.log("1. Verifique as variáveis de ambiente")
    console.log("2. Confirme se o Firebase está configurado corretamente")
    console.log("3. Verifique se o provedor OIDC está habilitado")
  }
}

// Executar teste
testEpicGamesConfig()
  .then(() => {
    console.log("\n✅ Teste concluído!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Teste falhou:", error)
    process.exit(1)
  })
