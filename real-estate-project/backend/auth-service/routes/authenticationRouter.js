import express from "express";
import axios from "axios";
import { AuthController } from "../controllers/AuthController.js";
import { enforceAuthentication } from "../middleware/authorization.js";

export const authenticationRouter = express.Router();

  authenticationRouter.post("/login", async (req, res) => {
      try {
          const credentials = await AuthController.checkCredentials(req);
          if (credentials) {
              const {authId, userId, role } = credentials;
              console.log('Generazione token con authId', authId, 'userId:', userId, 'e role:', role); // Log
              res.json(AuthController.issueToken(authId, userId, role));
              console.log("token generato")
          } else {
              res.status(401).json({ error: "Invalid credentials. Try again." });
          }
      } catch (error) {
        console.log(error);
          res.status(500).json({ error: error.message });
      }
  });

  // Route per la registrazione di un Customer
  authenticationRouter.post('/register/customer', async (req, res) => {
    try {
      const result = await AuthController.registerCustomer(req, res);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: `Errore durante la registrazione: ${error.message}` });
    }
  });

  // Route per aggiornare le credenziali
  authenticationRouter.put('/credentials/:id', enforceAuthentication, async (req, res) => {
      try {
          const result = await AuthController.updateCredentials(req, res);
          res.status(200).json(result);
      } catch (error) {
          res.status(500).json({ message: `Errore durante l'aggiornamento delle credenziali: ${error.message}` });
      }
  });

  // Route per eliminare le credenziali
  authenticationRouter.delete('/credentials/:id', enforceAuthentication, async (req, res) => {
    try {
        console.log('Esecuzione DELETE /credentials/:id - ID:', req.params.id);
        const result = await AuthController.deleteCredentials(req, res);
        // Non inviare una risposta qui, lasciala al controller
    } catch (error) {
        console.error('Errore nella route DELETE /credentials/:id:', error);
        res.status(500).json({ message: `Errore durante l'eliminazione: ${error.message}` });
    }
  });
  
  // Route per la registrazione di un Agent
  authenticationRouter.post('/register/agent', enforceAuthentication, async (req, res) => {
    try {
      const result = await AuthController.registerAgent(req, res);
      res.status(201).json(result);
    } catch (error) {
      res.status(error.message.includes('Solo un admin') ? 403 : 500).json({ message: error.message });
    }
  });
  
  // Route per la registrazione di un Admin
  authenticationRouter.post('/register/admin', enforceAuthentication, async (req, res) => {
    try {
      const result = await AuthController.registerAdmin(req, res);
      res.status(201).json(result);
    } catch (error) {
      res.status(error.message.includes('Solo un Manager') ? 403 : 500).json({ message: error.message });
    }
  });

  authenticationRouter.post('/register/manager', async (req, res) => {
    try {
      const result = await AuthController.registerManager(req, res);
      res.status(201).json(result);
    } catch (error) {
      res.status(error.message.includes('Solo un Manager') ? 403 : 500).json({ message: error.message });
    }
  });

  // Route per la registrazione di un'agenzia
  authenticationRouter.post('/register/agency', async (req, res) => {
    try {
      const result = await AuthController.registerCompany(req, res);
      res.status(201).json(result);
    } catch (error) {
      res.status(error.message.includes('Solo un Manager') ? 403 : 500).json({ message: error.message });
    }
  });

  // Route per la validazione del token 
  authenticationRouter.post('/validate', async (req, res) => {
        try {
            const result = await AuthController.validateToken(req, res);
            res.status(200).json(result);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token scaduto' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token non valido' });
        }
        res.status(400).json({ message: error.message });
        }
  });


authenticationRouter.get('/check/user/:id', (req, res, next) => {
    const id = req.params.id;
    AuthController.checkUser(id).then(result => {
      res.status(200).json(result);
    }).catch(err => {
      next(err);
      console.log(err.message);
    });
});





  



