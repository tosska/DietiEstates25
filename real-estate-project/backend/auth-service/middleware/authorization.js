import { AuthController } from '../controllers/AuthController.js';

  export const enforceAuthentication = async (req, res, next) => {
      console.log('Verificando token:', req.headers.authorization);
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Token mancante' });
      try {
          console.log('Decodificando token:', token);
          const user = await AuthController.isTokenValid(token);
          console.log('Utente decodificato:', user);
          if (!user || !user.role) throw new Error('Utente o ruolo non validi');
          req.user = user;
          next();
      } catch (error) {
          console.error('Errore nella verifica del token:', error);
          return res.status(401).json({ error: error.message || 'Token non valido' });
      }
  };