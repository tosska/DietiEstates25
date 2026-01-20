@echo off
TITLE DietiEstates25 - Avvio Completo con DB Init

echo.
echo ============================================================
echo   FASE 1: Avvio Infrastruttura
echo   (Database, RabbitMQ, Meili, Kong)
echo ============================================================
echo.

REM Avvia l'infrastruttura
docker compose up -d --build db rabbitmq meilisearch kong

echo.
echo [INFO] Attendo che il Database sia pronto per ricevere i dati...

REM --- LOOP DI ATTESA SALUTE DB ---
:wait_db
timeout /t 2 /nobreak >nul
docker inspect --format "{{.State.Health.Status}}" dieti_postgres_db | find "healthy" >nul
IF %ERRORLEVEL% NEQ 0 (
    echo  ... In attesa di Postgres ...
    GOTO wait_db
)
echo [OK] Database pronto!

echo.
echo ============================================================
echo   FASE 1.5: Popolamento Database (Script SQL)
echo ============================================================
echo.

REM Esegue lo script SQL dentro il container
REM Nota: Usa 'type' per Windows e il path con backslash
type support-infra\script.sql | docker exec -i dieti_postgres_db psql -U postgres -d DietiUnina

IF %ERRORLEVEL% EQU 0 (
    echo [OK] Dati inseriti correttamente.
) ELSE (
    echo [ERRORE] Impossibile eseguire lo script SQL.
)

echo.
echo ============================================================
echo   FASE 2: Avvio Microservizi Applicativi
echo ============================================================
echo.

docker compose up -d --build authentication-service listing-service customer-service offer-service search-service

echo.
echo [OK] Sistema avviato e popolato!
pause