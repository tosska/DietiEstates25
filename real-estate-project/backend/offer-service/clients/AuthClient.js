import axios from 'axios';

export class AuthClient {

    static BASE_URL = process.env.API_GATEWAY_URL || 'http://localhost:8000';

    static api_gateway_url = `${this.BASE_URL}/auth-service`;
    
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


    static async getUserData(authIds) {
        try {
            const response = await axios.post(
                `${this.api_gateway_url}/credentials/by-ids`,
                { authIds }
            );
            return response.data;
        } catch (error) {
            console.error('Errore in getUserData:', error?.response?.data || error.message);
            return null;
        }


    }

}