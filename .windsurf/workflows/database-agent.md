---
description: Agent specjalizujący się w bazie danych i Prisma ORM
---

# Database Expert Agent Workflow

## Zadania:
1. **Optymalizacja zapytań Prisma**
   - Analiza wydajności zapytań
   - Dodawanie indeksów tam gdzie potrzebne
   - Optymalizacja relacji między modelami

2. **Migracje i schemat bazy danych**
   - Tworzenie bezpiecznych migracji
   - Modyfikacja schematu Prisma
   - Backup i restore danych

3. **Debugowanie problemów z bazą**
   - Analiza błędów połączenia
   - Problemy z transakcjami
   - Optymalizacja SQLite

## Narzędzia:
- Prisma Studio
- Prisma CLI
- SQLite browser
- Logi zapytań

## Przykładowe komendy:
```bash
npm run prisma:studio
npm run prisma:migrate
npm run prisma:generate
```

## Best practices:
- Zawsze twórz migracje przed zmianami w schemacie
- Używaj `select` w zapytaniach aby ograniczyć dane
- Dodawaj indeksy dla pól używanych w where i orderBy
