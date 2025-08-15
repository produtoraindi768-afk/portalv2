#!/usr/bin/env tsx

/**
 * Script para testar a configuração do Firebase
 * Execute: npx tsx src/scripts/test-firebase-config.ts
 */

import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

async function testFirebaseConfig() {
  console.log("🔍 Testando configuração do Firebase...")
  
  try {
    // Configuração do Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyBMJ_OR41iCIMGDEmGYUkf1mI6Aym9W04w",
      authDomain: "dashboard-f0217.firebaseapp.com",
      projectId: "dashboard-f0217",
      storageBucket: "dashboard-f0217.firebasestorage.app",
      messagingSenderId: "791615571",
      appId: "1:791615571:web:396e6bc323a648864d0ea6",
      measurementId: "G-DN79LHPJ42"
    }
    
    console.log("1. Inicializando Firebase...")
    const app = initializeApp(firebaseConfig)
    console.log("✅ Firebase inicializado com sucesso")
    
    console.log("2. Configurando autenticação...")
    const auth = getAuth(app)
    console.log("✅ Autenticação configurada")
    
    console.log("3. Verificando configuração...")
    console.log("   - Project ID:", app.options.projectId)
    console.log("   - Auth Domain:", app.options.authDomain)
    console.log("   - API Key:", app.options.apiKey ? "✅ Configurada" : "❌ Não configurada")
    
    console.log("\n🎯 Configuração Firebase OK!")
    console.log("📋 Próximos passos:")
    console.log("1. Atualize as variáveis de ambiente no Vercel")
    console.log("2. Faça um novo deploy")
    console.log("3. Teste a autenticação Epic Games")
    
  } catch (error) {
    console.error("❌ Erro na configuração:", error)
    console.log("\n🔧 Soluções possíveis:")
    console.log("1. Verifique se a API Key está correta")
    console.log("2. Confirme se o projeto está ativo no Firebase Console")
    console.log("3. Verifique se a autenticação está habilitada")
  }
}

// Executar teste
testFirebaseConfig()
  .then(() => {
    console.log("\n✅ Teste concluído!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Teste falhou:", error)
    process.exit(1)
  })
