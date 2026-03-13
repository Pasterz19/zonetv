#!/bin/bash
echo "=== Synchronizacja z GitHub ==="
git add .
git commit -m "Aktualizacja: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main
echo "=== Zakończono ==="
