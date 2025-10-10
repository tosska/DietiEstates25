import axios from 'axios';

export class AgencyClient {

    static api_gateway_url = process.env.API_GATEWAY_URL || 'http://localhost:8000/agency-service';
    static api_gateway_internal_url = process.env.API_GATEWAY_INTERNAL_URL || 'http://localhost:8000/agency-internal';
    
    static async getAgencyIdByAgentId(agentId){

        try {
            const response = await axios.get(
                `${this.api_gateway_internal_url}/agent/${agentId}/agencyId`,
                { headers: { 'apikey': process.env.INTERNAL_API_KEY } }
            );

            return response.data.agencyId;
        } catch (error) {
            console.error('Errore in getAgencyIdByAgentId:', error?.response?.data || error.message);
            return null;
        }


    }

}