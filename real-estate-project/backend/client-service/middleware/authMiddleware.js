export const verifyAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token mancante' });
        }

        const response = await fetch('http://localhost:3001/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Token non valido');
        }

        const { userId, role } = await response.json();
        console.log('Token decodificato:', { userId, role });

        req.user = { userId, role };

        // Autorizza solo admin per tutte le operazioni (i customer saranno gestiti nei controller per PUT/DELETE)
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Solo gli admin sono autorizzati a eseguire questa operazione' });
        }

        next();
    } catch (error) {
        console.log('Errore nella verifica del token:', error.message);
        return res.status(401).json({ message: 'Token non valido: ' + error.message });
    }
};