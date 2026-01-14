import axios from 'axios';

export class AuthClient {

    // URL del gateway o servizio auth diretto
    static api_gateway_url = process.env.API_GATEWAY_URL || 'http://localhost:8000/auth-service';

    /**
     * Verifica se un utente esiste (usato dal middleware per header context)
     */
    static async checkUser(authId) {
        try {
            const response = await axios.get(
                `${this.api_gateway_url}/check/user/${authId}`
            );
            return response.data;
        } catch (error) {
            console.error('Errore in checkUser:', error?.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Valida un token JWT chiamando auth-service (usato se serve validazione stretta)
     */
    static async validateToken(token) {
        try {
            const response = await axios.post(
                `${this.api_gateway_url}/validate`, 
                { token },
                { headers: { 'Content-Type': 'application/json' } }
            );
            return response.data; // { userId, role, authId }
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Token non valido');
        }
    }
}