'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatNewsTitle, formatTextContent } from '@/lib/text-utils'

const testTexts = [
  'NOVIDADES DE ARMAS E UTILITÁRIO - SMG DE PRECISÃO E PAREDE BLINDADA! 🔥',
  'epic games anuncia NOVO BATTLE ROYALE para PC e XBOX',
  'fortnite    chapter    5    season    2!!!    novidades    incríveis',
  'TWITCH STREAMERS FAZEM LIVE DE 24 HORAS NO YOUTUBE 🎮🔴',
  'nintendo switch vs ps5 vs xbox series x - qual é melhor???',
  'MOBA vs MMORPG vs FPS - ENTENDA AS DIFERENÇAS',
  'discord e steam anunciam parceria para jogadores de pc',
  '🎯 DICAS PARA MELHORAR NO FORTNITE 🏆 GUIA COMPLETO 2024',
  // Testes específicos para palavras pequenas
  'é',
  'ou',
  'a',
  'o jogo é bom',
  'fortnite ou valorant',
  'é muito bom',
  'a melhor estratégia',
  'EPIC GAMES É A MELHOR EMPRESA DE JOGOS'
]

export function TextFormattingDemo() {
  const [customText, setCustomText] = useState('')
  const [showDemo, setShowDemo] = useState(false)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Demo de Formatação Inteligente de Texto
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDemo(!showDemo)}
            >
              {showDemo ? 'Ocultar' : 'Mostrar'} Demo
            </Button>
          </CardTitle>
        </CardHeader>
        
        {showDemo && (
          <CardContent className="space-y-6">
            {/* Custom Text Input */}
            <div className="space-y-3">
              <h3 className="font-semibold">Teste seu próprio texto:</h3>
              <Input
                placeholder="Digite um texto para testar a formatação..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
              {customText && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Texto original:</div>
                  <div className="p-3 bg-muted rounded text-sm font-mono">{customText}</div>
                  <div className="text-sm text-muted-foreground">Texto formatado:</div>
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded font-medium">
                    {formatNewsTitle(customText, { applyCapitalization: true })}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Test Examples */}
            <div className="space-y-4">
              <h3 className="font-semibold">Exemplos de formatação:</h3>
              <div className="grid gap-4">
                {testTexts.map((text, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                      <div className="flex-1 space-y-2">
                        <div className="text-sm text-muted-foreground">Original:</div>
                        <div className="p-2 bg-muted rounded text-sm font-mono break-all">
                          {text}
                        </div>
                        <div className="text-sm text-muted-foreground">Formatado:</div>
                        <div className="p-2 bg-primary/5 border border-primary/20 rounded font-medium">
                          {formatNewsTitle(text, { applyCapitalization: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Features List */}
            <div className="space-y-3">
              <h3 className="font-semibold">Recursos da formatação inteligente:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✅</Badge>
                  Converte texto em MAIÚSCULO para capitalização adequada
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✅</Badge>
                  Preserva emojis e caracteres especiais
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✅</Badge>
                  Remove espaços excessivos e normaliza pontuação
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✅</Badge>
                  Aplica capitalização correta para termos de gaming (Fortnite, Epic Games, etc.)
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✅</Badge>
                  Mantém artigos e preposições em minúsculo quando apropriado
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✅</Badge>
                  Trata siglas de jogos corretamente (FPS, MOBA, RPG, etc.)
                </li>
              </ul>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}