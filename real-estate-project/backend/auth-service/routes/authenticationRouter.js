import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { enforceAuthentication } from "../middleware/authorization.js";
import { 
    loginValidation, 
    registerCustomerValidation, 
    registerAgentValidation, 
    registerAdminValidation, 
    registerAgencyValidation,
    changePasswordValidation // <--- Importato
} from "../middleware/validation.js";

export const authenticationRouter = express.Router();

// --- LOGIN ---
authenticationRouter.post("/login", loginValidation, async (req, res) => {
    try {
        const result = await AuthController.checkCredentials(req);
        
        const tokenData = AuthController.issueToken(result.authId, result.userId, result.role);
        
        res.status(200).json({ 
            token: tokenData.token, 
            role: result.role, 
            userId: result.userId,
            mustChangePassword: result.mustChangePassword 
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

// --- CHANGE PASSWORD FIRST LOGIN (ROTTA MANCANTE AGGIUNTA) ---
authenticationRouter.post('/change-password-first-login', enforceAuthentication, changePasswordValidation, async (req, res) => {
    try {
        const { password } = req.body;
        const { authId } = req.user; // ID estratto dal token

        await AuthController.changePasswordFirstLogin(authId, password);
        
        res.status(200).json({ message: 'Password aggiornata con successo' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- REGISTRAZIONI ---
authenticationRouter.post('/register/customer', registerCustomerValidation, async (req, res) => {
    try {
        const result = await AuthController.registerCustomer(req);
        res.status(201).json(result);
    } catch (error) {
        if (!res.headersSent) res.status(500).json({ message: error.message });
    }
});

authenticationRouter.post('/register/agency', registerAgencyValidation, async (req, res) => {
    try {
        const result = await AuthController.registerCompany(req);
        res.status(201).json(result);
    } catch (error) {
        if (!res.headersSent) res.status(500).json({ message: error.message });
    }
});

authenticationRouter.post('/register/agent', enforceAuthentication, registerAgentValidation, async (req, res) => {
    try {
        const result = await AuthController.registerAgent(req);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

authenticationRouter.post('/register/admin', enforceAuthentication, registerAdminValidation, async (req, res) => {
    try {
        const result = await AuthController.registerAdmin(req);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- CRUD CREDENTIALS ---

authenticationRouter.get('/credentials/:id', enforceAuthentication, async (req, res) => {
    try {
        const result = await AuthController.getCredentialsById(req);
        res.status(200).json(result);
    } catch (error) {
        const status = error.message === 'Credenziali non trovate' ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
});

authenticationRouter.put('/credentials/:id', enforceAuthentication, async (req, res) => {
    try {
        const result = await AuthController.updateCredentials(req);
        res.status(200).json(result);
    } catch (error) {
        const status = error.message === 'Credenziali non trovate' ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
});

authenticationRouter.delete('/credentials/:id', enforceAuthentication, async (req, res) => {
    try {
        const result = await AuthController.deleteCredentials(req);
        res.status(200).json(result);
    } catch (error) {
        let status = 500;
        if (error.message === 'Credenziali non trovate') status = 404;
        if (error.message === 'Non autorizzato') status = 403;
        res.status(status).json({ message: error.message });
    }
});

// --- UTILITY ---

authenticationRouter.post('/validate', async (req, res) => {
    try {
        const result = await AuthController.validateToken(req);
        res.status(200).json(result);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

authenticationRouter.get('/check/user/:id', async (req, res) => {
    try {
        await AuthController.checkUser(req.params.id);
        res.status(200).send();
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});