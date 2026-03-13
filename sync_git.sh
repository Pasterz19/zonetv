#!/bin/bash
echo "=== Rozpoczynam synchronizację ==="
git add .
git commit -m "Aktualizacja: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main
echo "=== Synchronizacja zakończona ==="
