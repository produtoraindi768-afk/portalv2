# Animate-UI Components Setup

This document explains how the Animate-UI components were manually installed due to MCP server timeout issues.

## Problem Encountered

The MCP (Model Context Protocol) server for Animate-UI was experiencing timeout errors:

```
failed to initialize MCP client for Animate-UI: transport error: context deadline exceeded
```

## Root Cause Analysis

The timeout error was caused by:
- Network connectivity issues during MCP client initialization
- Registry access delays from `https://animate-ui.com/r/registry.json`
- Windows PowerShell compatibility issues with some commands
- NPX cache corruption

## Resolution Applied

### Manual Component Installation

Instead of using the MCP server, components were manually created based on the Animate-UI registry:

#### 1. Created Background Components
- **BubbleBackground** (`src/components/animate-ui/backgrounds/bubble.tsx`)
  - Interactive animated gradient bubbles
  - Configurable bubble count, speed, and colors
  - Uses Framer Motion for smooth animations

- **GradientBackground** (`src/components/animate-ui/backgrounds/gradient.tsx`)  
  - Animated gradient background effects
  - Customizable colors, speed, and blur levels
  - Perfect for hero sections and decorative backgrounds

#### 2. Created Button Components
- **CopyButton** (`src/components/animate-ui/buttons/copy.tsx`)
  - Animated copy-to-clipboard functionality
  - Multiple variants (default, outline, secondary, ghost)
  - Success state animation with icon transition
  - TypeScript-safe props interface

#### 3. Updated Index File
- Created comprehensive export file (`src/components/animate-ui/index.ts`)
- Exports all new components plus existing ones
- Proper TypeScript type exports
- Easy import syntax: `import { BubbleBackground } from '@/components/animate-ui'`

## Component Features

### BubbleBackground
```tsx
<BubbleBackground 
  className="rounded-lg" 
  bubbleCount={20} 
  speed="normal"
  colors={[
    "from-blue-400/20 to-purple-400/20",
    "from-pink-400/20 to-rose-400/20",
  ]}
/>
```

**Props:**
- `className?: string` - Additional CSS classes
- `bubbleCount?: number` - Number of bubbles (default: 20)
- `colors?: string[]` - Array of Tailwind gradient classes
- `speed?: "slow" | "normal" | "fast"` - Animation speed

### GradientBackground
```tsx
<GradientBackground 
  className="rounded-lg" 
  speed="slow"
  blur="lg"
  colors={[
    "from-purple-400 via-pink-400 to-red-400",
    "from-blue-400 via-purple-400 to-pink-400",
  ]}
/>
```

**Props:**
- `className?: string` - Additional CSS classes
- `colors?: string[]` - Array of gradient color classes
- `speed?: "slow" | "normal" | "fast"` - Animation speed
- `blur?: "sm" | "md" | "lg" | "xl"` - Blur intensity

### CopyButton
```tsx
<CopyButton 
  text="Hello, World!" 
  variant="outline"
  successDuration={2000}
>
  Copy Text
</CopyButton>
```

**Props:**
- `text: string` - Text to copy to clipboard
- `variant?: "default" | "outline" | "secondary" | "ghost"` - Button style
- `size?: "default" | "sm" | "lg" | "icon"` - Button size
- `successDuration?: number` - Success state duration (default: 2000ms)

## Dependencies

The components require these dependencies (already installed):
- `motion` - For animations
- `lucide-react` - For icons
- `class-variance-authority` - For variant management
- `@/lib/utils` - For className utilities

## Usage Examples

See `src/components/animate-ui/examples.tsx` for comprehensive usage examples.

### Basic Import
```tsx
import { 
  BubbleBackground, 
  GradientBackground, 
  CopyButton 
} from '@/components/animate-ui'
```

### Advanced Usage
```tsx
// Combined background effects
<div className="relative">
  <BubbleBackground bubbleCount={15} speed="fast" />
  <GradientBackground className="opacity-50" />
  <div className="relative z-10">
    <CopyButton text="Amazing!" variant="outline" />
  </div>
</div>
```

## Alternative Installation Methods

If MCP server issues are resolved in the future, you can use:

```bash
# Standard shadcn CLI (from web/ directory)
npx shadcn@latest add https://animate-ui.com/r/bubble-background
npx shadcn@latest add https://animate-ui.com/r/gradient-background
npx shadcn@latest add https://animate-ui.com/r/copy-button

# Or with MCP server
npx -y shadcn@canary registry:mcp REGISTRY_URL=https://animate-ui.com/r/registry.json
```

## Troubleshooting MCP Issues

If you encounter similar MCP timeout issues:

1. **Clear NPX cache:**
   ```bash
   # Windows PowerShell (as Administrator)
   Remove-Item -Recurse -Force "$env:APPDATA\npm-cache"
   Remove-Item -Recurse -Force "$env:LOCALAPPDATA\npm-cache"
   ```

2. **Test registry connectivity:**
   ```bash
   Invoke-WebRequest -Uri "https://animate-ui.com/r/registry.json" -Method Get
   ```

3. **Try alternative network:**
   - Switch to mobile hotspot
   - Check corporate firewall settings
   - Verify proxy configuration

4. **Use manual installation** (as demonstrated in this setup)

## File Structure

```
src/components/animate-ui/
├── backgrounds/
│   ├── bubble.tsx
│   └── gradient.tsx
├── buttons/
│   └── copy.tsx
├── effects/
│   └── motion-highlight.tsx (existing)
├── radix/
│   ├── sheet.tsx (existing)
│   ├── sidebar.tsx (existing)
│   └── tooltip.tsx (existing)
├── examples.tsx
└── index.ts
```

## Next Steps

1. Test components in your application
2. Create additional variants as needed
3. Add more Animate-UI components manually if required
4. Monitor for MCP server stability improvements

## Support

For issues with:
- **Animate-UI components**: Visit https://animate-ui.com
- **MCP server**: Check https://docs.qoder.com/troubleshooting/mcp-common-issue
- **This setup**: Review the implementation in the component files