#!/bin/bash
CD_PATH="/home/damian/projekty/zonetv"
cd $CD_PATH

while true; do
  # 1. Pobierz zmiany z GitHub (jeśli coś zmieniłeś np. przez stronę WWW)
  git pull origin main --rebase

  # 2. Dodaj wszystkie nowe pliki i zmiany
  git add .

  # 3. Jeśli są jakieś zmiany, zrób commit i wypchnij (push)
  if ! git diff-index --quiet HEAD; then
    git commit -m "Auto-sync: $(date +'%Y-%m-%d %H:%M:%S')"
    git push origin main
    echo "Zsynchronizowano o $(date)"
  fi

  # Czekaj 5 minut przed kolejną próbą
  sleep 300
done

