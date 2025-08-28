# Integração GSAP - StreamersSection

## 🚀 Como Usar

### Substituir na página principal:

```tsx
// Antes
import { StreamersSection } from "@/components/sections/StreamersSection"

// Depois
import { GSAPStreamersSection } from "@/components/sections/GSAPStreamersSection"

// Uso
<GSAPStreamersSection 
  enableAdvancedAnimations={true}
  animationSettings={{
    duration: 0.8,
    ease: "power2.out",
    enableParallax: true,
    parallaxIntensity: 0.3,
    enableBreathing: true,
    enableFloating: true,
    enableMorphing: true
  }}
/>
```

## 🎬 Melhorias Implementadas

### 1. **Scroll Animações**
- **Parallax**: Players se movem com scroll
- **Morphing**: Deformação sutil baseada no scroll
- **Performance**: Hardware accelerated

### 2. **Estados do Player**
- **Breathing**: Player ativo "respira"
- **Floating**: Flutuação contínua
- **3D Effects**: Rotações sutis nos players laterais
- **Glow**: Sombras dinâmicas

### 3. **Transições**
- **Smooth**: Transições fluidas entre streams
- **Direction-aware**: Animação baseada na direção
- **Timeline**: Animações coordenadas

## ⚙️ Configurações

```tsx
interface AnimationSettings {
  duration?: number          // Duração (padrão: 0.8s)
  ease?: string             // Easing (padrão: "power2.out")
  enableParallax?: boolean  // Parallax (padrão: true)
  parallaxIntensity?: number // Intensidade (padrão: 0.3)
  enableBreathing?: boolean // Respiração (padrão: true)
  enableFloating?: boolean  // Flutuação (padrão: true)
  enableMorphing?: boolean  // Morphing (padrão: true)
}
```

## 📱 Responsividade

- **Mobile**: Animações reduzidas para performance
- **Tablet**: Animações médias
- **Desktop**: Animações completas

## 🚀 Performance

- Transform3d para hardware acceleration
- RequestAnimationFrame para smoothness
- Cleanup automático de animações
- Scroll throttling para 60fps

## 🔧 Implementação

1. **Backup**: Renomeie StreamersSection atual
2. **Importe**: Use GSAPStreamersSection na página
3. **Configure**: Ajuste animationSettings conforme necessário
4. **Teste**: Verifique em diferentes dispositivos