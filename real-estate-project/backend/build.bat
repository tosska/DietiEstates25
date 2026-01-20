@echo off
TITLE DietiEstates25 - Avvio Sequenziale

echo.
echo ============================================================
echo   FASE 1: Avvio Infrastruttura (Support-Infra)
echo   (Database, RabbitMQ, Meili, Kong)
echo ============================================================
echo.

REM Avvia solo l'infrastruttura
docker compose up -d --build db rabbitmq meilisearch kong

echo.
echo [INFO] Attendo 30 secondi per permettere ai servizi di inizializzarsi...
timeout /t 30 /nobreak >nul

echo.
echo ============================================================
echo   FASE 2: Avvio Microservizi Applicativi
echo   (Auth, Listing, Customer, Offer, Search)
echo ============================================================
echo.

docker compose up -d --build authentication-service listing-service customer-service offer-service search-service
docker compose up -d --build authentication-service listing-service customer-service offer-service search-service

echo.
echo [OK] Tutti i container sono stati avviati nell'ordine corretto!
echo.
pause