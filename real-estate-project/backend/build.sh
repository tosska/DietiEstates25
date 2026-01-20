#!/bin/bash

# Titolo dello script (solo echo, non cambia il titolo della finestra come in Windows)
echo "DietiEstates25 - Avvio Completo con DB Init"

echo ""
echo "============================================================"
echo "   FASE 1: Avvio Infrastruttura"
echo "   (Database, RabbitMQ, Meili, Kong)"
echo "============================================================"
echo ""

# Avvia l'infrastruttura
docker compose up -d --build db rabbitmq meilisearch kong

echo ""
echo "[INFO] Attendo che il Database sia pronto per ricevere i dati..."

# --- LOOP DI ATTESA SALUTE DB ---
# Controlla lo stato health del container ogni 2 secondi
while [ "$(docker inspect --format "{{.State.Health.Status}}" dieti_postgres_db 2>/dev/null)" != "healthy" ]; do
    echo " ... In attesa di Postgres ..."
    sleep 2
done

echo "[OK] Database pronto!"

echo ""
echo "============================================================"
echo "   FASE 1.5: Popolamento Database (Script SQL)"
echo "============================================================"
echo ""

# Esegue lo script SQL dentro il container
# Nota: Usa 'cat' invece di 'type' e slash normali '/'
if cat support-infra/script.sql | docker exec -i dieti_postgres_db psql -U postgres -d DietiUnina; then
    echo "[OK] Dati inseriti correttamente."
else
    echo "[ERRORE] Impossibile eseguire lo script SQL."
fi

echo ""
echo "============================================================"
echo "   FASE 2: Avvio Microservizi Applicativi"
echo "============================================================"
echo ""

# Avvia i microservizi
docker compose up -d --build authentication-service listing-service customer-service offer-service search-service agency-service

echo ""
echo "[OK] Sistema avviato e popolato!"

# Opzionale: mantiene il terminale aperto se lanciato con doppio click (rimuovilo se non serve)
read -p "Premi Invio per uscire..."