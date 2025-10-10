import axios from 'axios';

export class AgencyClient {

    static api_gateway_url = process.env.API_GATEWAY_URL || 'http://localhost:8000/agency-service';
    static intern_url = process.env.API_GATEWAY_URL_INTERN || 'http://localhost:8000/agency-internal';
    

    static async getAgentId(credential_id) {

        try {
            const response = await axios.get(
                `${this.intern_url}/agent/${credential_id}/businessId`,
                { headers: { 'apikey': process.env.INTERNAL_API_KEY } }
            );
                       
            return response.data.id;
        } catch (error) {
            console.error('Errore in getAgentId:', error?.response?.data || error.message);
            return null;
        }
    }

    static async getAdminId(credential_id) {

        return axios.get(`${this.intern_url}/admin/${credential_id}/businessId`
            , { headers: { 'apikey': process.env.INTERNAL_API_KEY } }
        )

    }





}