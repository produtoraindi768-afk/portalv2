#!/usr/bin/env tsx

/**
 * Script para verificar se a API Key do Firebase está correta
 * Execute: npx tsx src/scripts/verify-api-key.ts
 */

async function verifyApiKey() {
  console.log("🔍 Verificando API Key do Firebase...")
  
  try {
    // Obter a API Key das variáveis de ambiente
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    
    if (!apiKey) {
      console.error("❌ API Key não encontrada nas variáveis de ambiente")
      console.log("🔧 Solução: Configure NEXT_PUBLIC_FIREBASE_API_KEY no Vercel")
      return
    }
    
    console.log("✅ API Key encontrada:", apiKey.substring(0, 10) + "...")
    
    // Testar a API Key fazendo uma requisição para o Firebase
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dashboard-f0217"
    const url = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}?key=${apiKey}`
    
    console.log("🌐 Testando API Key...")
    const response = await fetch(url)
    
    if (response.ok) {
      console.log("✅ API Key válida!")
      try {
        const data = await response.json()
        console.log("📋 Projeto:", data.projectId)
        console.log("🔗 Auth Domain:", data.authDomain)
      } catch (parseError) {
        console.log("✅ API Key válida (resposta não-JSON)")
      }
    } else {
      console.error("❌ API Key inválida!")
      try {
        const error = await response.json()
        console.error("📋 Erro:", error.error?.message)
      } catch (parseError) {
        console.error("📋 Status:", response.status, response.statusText)
      }
      console.log("🔧 Solução: Verifique a API Key no Firebase Console")
    }
    
  } catch (error) {
    console.error("❌ Erro ao verificar API Key:", error)
  }
}

// Executar verificação
verifyApiKey()
  .then(() => {
    console.log("\n✅ Verificação concluída!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Verificação falhou:", error)
    process.exit(1)
  })
