import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { enforceAuthentication } from "../middleware/authorization.js";

export const authenticationRouter = express.Router();

authenticationRouter.get('/test', (req, res) => {
  res.send('Server is running!');
});

authenticationRouter.post("/login", async (req, res) => {
    let isAuthenticated = await AuthController.checkCredentials(req, res);
    if (isAuthenticated) {
        res.json(AuthController.issueToken(req.body.usr));
    } else {
        res.status(401);
        res.json( {error: "Invalid credentials. Try again."});
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

  // Route per la validazione del token DA RIVEDERE
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



// authenticationRouter.post("/signup", (req, res, next) => {
//     AuthController.saveUser(req, res).then((user) => {
//         res.json(user);
//     }).catch((err) => {
//         console.error(err);
//         next({status: 500, message: "Could not save user"});
//     })
// });

// authenticationRouter.post('/agents', enforceAuthentication, async (req, res) => {
//     try {
//       const { email, password, name, surname } = req.body;
//       const userRole = req.user.role; // Ruolo dal token decodificato
//       if (!['admin', 'gestore'].includes(userRole)) {
//         return res.status(403).json({ message: 'Non autorizzato: solo admin o gestori possono creare agenti' });
//       }
//       const agent = await User.create({ email, password, name, surname, role: 'agent' });
//       res.status(201).json({ message: 'Agente creato con successo', agent });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
// });