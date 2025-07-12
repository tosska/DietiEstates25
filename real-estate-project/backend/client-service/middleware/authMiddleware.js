export const verifyAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('Header Authorization ricevuto nel backend:', authHeader); // Debug
        const token = authHeader?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token mancante' });
        }
        console.log('Token estratto per /validate:', token); // Debug

        const response = await fetch('http://localhost:3001/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Host': 'localhost:3001'
            },
            body: JSON.stringify({ token }),
        });

        console.log('Risposta da /validate - Status:', response.status); // Debug
        if (!response.ok) {
            const errorData = await response.json();
            console.log('Errore da /validate:', errorData); // Debug
            throw new Error(errorData.message || 'Token non valido');
        }

        const { userId, role } = await response.json();
        console.log('Token decodificato:', { userId, role });

        req.user = { userId, role };

        if (role !== 'admin' && role !== 'customer') {
            return res.status(403).json({ message: 'Solo admin o customer sono autorizzati' });
        }

        next();
    } catch (error) {
        console.log('Errore nella verifica del token:', error.message);
        return res.status(401).json({ message: 'Token non valido: ' + error.message });
    }
};