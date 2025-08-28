import { Metadata } from "next"
import AppleHeroSection from "@/components/sections/AppleHeroSection"
import { NewsSection } from "@/components/sections/NewsSection"
// Novo componente GSAP em vez do antigo StreamersSection
import { GSAPStreamersSection } from "@/components/sections/GSAPStreamersSection"
import { FeaturedMatchesSection } from "@/components/sections/FeaturedMatchesSection"
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars"
import { Separator } from "@/components/ui/separator"
import { SectionWrapper, PageWrapper, Typography } from "@/components/layout"

export const metadata: Metadata = {
  title: "Home | SZ - Fortnite Ballistic",
}

export default function HomeWithGSAP() {
  return (
    <StarsBackground 
      className="relative min-h-screen" 
      starColor="#ffffff" 
      speed={60}
      factor={0.03}
    >
      {/* Hero Section - Espaçamento mínimo do header */}
      <section id="hero" className="pt-3 sm:pt-4 md:pt-6">
        <AppleHeroSection />
      </section>
      
      {/* Separator Apple-style - espaçamento sutil */}
      <div className="py-4 sm:py-6">
        <PageWrapper maxWidth="wide" paddingY="none">
          <div className="flex justify-center">
            <Separator className="bg-gradient-to-r from-transparent via-border/20 to-transparent max-w-xs" />
          </div>
        </PageWrapper>
      </div>
      
      {/* Streamers Section - NOVO com GSAP avançado */}
      <SectionWrapper spacing="normal" background="transparent">
        <PageWrapper maxWidth="wide" paddingY="normal">
          {/* 🚀 NOVO: GSAPStreamersSection com animações avançadas */}
          <GSAPStreamersSection 
            enableAdvancedAnimations={true}
            animationSettings={{
              // Configuração balanceada para produção
              duration: 0.8,
              ease: "power2.out",
              enableParallax: true,
              parallaxIntensity: 0.3,
              enableBreathing: true,
              enableFloating: true,
              enableMorphing: true
            }}
          />
        </PageWrapper>
      </SectionWrapper>
      
      {/* Separator entre Streamers e News - mais sutil */}
      <div className="py-3 sm:py-4">
        <PageWrapper maxWidth="wide" paddingY="none">
          <div className="flex justify-center">
            <Separator className="bg-gradient-to-r from-transparent via-border/15 to-transparent max-w-sm" />
          </div>
        </PageWrapper>
      </div>
      
      {/* News Section - espaçamento compacto */}
      <SectionWrapper spacing="compact" background="transparent">
        <PageWrapper maxWidth="wide" paddingY="normal">
          {/* Header elegante para notícias */}
          <div className="text-center mb-8 lg:mb-12">
            <Typography variant="h2" className="font-light tracking-tight mb-3">
              Últimas Notícias
            </Typography>
            <Typography variant="lead" className="text-muted-foreground font-light max-w-2xl mx-auto">
              Fique por dentro das novidades e atualizações da comunidade
            </Typography>
          </div>
          
          <NewsSection limit={3} showHeader={false} />
        </PageWrapper>
      </SectionWrapper>
    </StarsBackground>
  )
}

/* 
🎬 CONFIGURAÇÕES DISPONÍVEIS PARA GSAPStreamersSection:

1. CONFIGURAÇÃO PERFORMANCE (Mobile-friendly):
<GSAPStreamersSection 
  enableAdvancedAnimations={false}
  animationSettings={{
    duration: 0.4,
    ease: "power2.out",
    enableParallax: false,
    enableBreathing: false,
    enableFloating: false,
    enableMorphing: false
  }}
/>

2. CONFIGURAÇÃO DRAMÁTICA (Desktop high-end):
<GSAPStreamersSection 
  enableAdvancedAnimations={true}
  animationSettings={{
    duration: 1.2,
    ease: "power3.out",
    enableParallax: true,
    parallaxIntensity: 0.5,
    enableBreathing: true,
    enableFloating: true,
    enableMorphing: true
  }}
/>

3. CONFIGURAÇÃO SUTIL (Profissional):
<GSAPStreamersSection 
  enableAdvancedAnimations={true}
  animationSettings={{
    duration: 0.6,
    ease: "power1.out",
    enableParallax: true,
    parallaxIntensity: 0.1,
    enableBreathing: false,
    enableFloating: true,
    enableMorphing: false
  }}
/>

🚀 MELHORIAS IMPLEMENTADAS:

✅ Parallax baseado no scroll
✅ Efeito "breathing" no player ativo
✅ Animações de flutuação contínua
✅ Transições suaves entre streams
✅ Efeitos 3D sutis (rotateY)
✅ Morphing sutil baseado no scroll
✅ Hardware acceleration otimizada
✅ Cleanup automático de animações
✅ Responsividade avançada
✅ Performance throttling para 60fps

*/