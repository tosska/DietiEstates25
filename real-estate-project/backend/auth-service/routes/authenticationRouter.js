import express from "express";
import axios from "axios";
import { AuthController } from "../controllers/AuthController.js";
import { enforceAuthentication } from "../middleware/authorization.js";

export const authenticationRouter = express.Router();

  authenticationRouter.post("/login", async (req, res) => {
      try {
          const credentials = await AuthController.checkCredentials(req);
          if (credentials) {
              const { userId, role } = credentials;
              console.log('Generazione token con userId:', userId, 'e role:', role); // Log
              res.json(AuthController.issueToken(userId, role));
          } else {
              res.status(401).json({ error: "Invalid credentials. Try again." });
          }
      } catch (error) {
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

// TEMPORANEAMENTE QUI (da considerare microservizio geo-service)
authenticationRouter.get('/api/geocode', async (req, res) => {
  const { lat, lon, query } = req.query;
  try {
    let url;
    if (query) {
      url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=1`;
    } else if (lat && lon) {
      url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    } else {
      return res.status(400).json({ error: 'Parametri mancanti' });
    }

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Errore nella geolocalizzazione' });
  }
});

  



