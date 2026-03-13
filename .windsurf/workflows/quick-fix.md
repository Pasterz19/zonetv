---
description: Szybkie naprawy i debugging
---

# Quick Fix Agent Workflow

## Zadania:
1. **Szybka diagnostyka**
   - Sprawdzanie błędów w konsoli
   - Analiza logów
   - Network request debugging

2. **Common fixes**
   - Import/export issues
   - TypeScript errors
   - Tailwind class conflicts
   - Environment variables

3. **Performance issues**
   - Slow loading
   - Memory leaks
   - Bundle size analysis

## Narzędzia:
- Browser DevTools
- Next.js debugger
- TypeScript compiler
- ESLint

## Quick commands:
```bash
# Clear cache
rm -rf .next
npm run dev

# Check types
npm run build

# Lint
npm run lint

# Regenerate Prisma
npm run prisma:generate
```

## Common issues:
- Restart dev server po zmianie env vars
- Sprawdź .env.example dla wymaganych zmiennych
- Użyj `npm ci` zamiast `npm install` dla czystej instalacji
- Sprawdź port conflicts w dev server
