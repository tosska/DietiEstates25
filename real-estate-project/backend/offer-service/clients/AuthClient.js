import axios from 'axios';

export class AuthClient {

    static api_gateway_url = process.env.API_GATEWAY_URL || 'http://localhost:8000/auth-service';
    
    static async checkUser(authId){

        try {
            const response = await axios.get(
                `${this.api_gateway_url}/check/user/${authId}`,
            );
            return response.data;
        } catch (error) {
            console.error('Errore in checkUser:', error?.response?.data || error.message);
            return null;
        }


    }

}