import OpenAI from "openai"

export const NOVITA_DEFAULT_MODEL = "zai-org/glm-4.5"

export function getNovitaClient() {
  const apiKey = process.env.NOVITA_API_KEY
  if (!apiKey) {
    throw new Error("NOVITA_API_KEY não configurada. Defina no .env.local")
  }
  return new OpenAI({
    baseURL: "https://api.novita.ai/v3/openai",
    apiKey,
  })
}


