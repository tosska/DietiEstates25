import { AuthClient } from "../clients/AuthClient.js";

/**
 * Middleware principale per i microservizi dietro Gateway.
 * Legge gli header 'x-user-*' iniettati dal Gateway.
 */
export async function userContextMiddleware(req, res, next) {

    const authId = req.headers['x-user-authid'];
    const userId = req.headers["x-user-userid"];
    const role = req.headers['x-user-role'];
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    
    // Se mancano gli header, la richiesta non è passata dal Gateway autenticato
    if(!authId || !userId || !role) {  
        return res.status(401).json({ message: "Unauthorized: Missing Identity Headers" });
    }

    try {
        // Verifica opzionale: controlla esistenza utente su Auth Service
        await AuthClient.checkUser(authId);
    }
    catch(error) {
        return res.status(401).json({ message: "Unauthorized: Invalid User" });
    }

    // Popola req con i dati utente per i controller
    req.token = token;
    req.authId = authId;
    req.userId = userId;
    req.role = role;
    req.user = { userId, role, authId }; // Standardizzo in req.user

    next();
}

/**
 * Middleware alternativo per validazione diretta (senza Gateway)
 * Utile per test o chiamate dirette.
 */
export const verifyAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token mancante' });
        }

        // Valida tramite Client
        const decoded = await AuthClient.validateToken(token);
        
        req.user = { 
            userId: decoded.userId, 
            role: decoded.role,
            authId: decoded.authId
        };
        req.userId = decoded.userId;
        req.role = decoded.role;

        // Esempio controllo ruoli base (puoi personalizzarlo)
        if (decoded.role !== 'admin' && decoded.role !== 'customer') {
             // Lasciamo passare, il controller farà controlli più specifici se serve
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token non valido: ' + error.message });
    }
};