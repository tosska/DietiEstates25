import axios from 'axios';

export class AgencyClient {

    static BASE_URL = process.env.API_GATEWAY_URL || 'http://localhost:8000';

    static api_gateway_url = `${this.BASE_URL}/agency-service`;
    static api_gateway_internal_url = `${this.BASE_URL}/agency-internal`;
    
    static async getAgencyIdByAgentId(agentId){

        try {
            const response = await axios.get(
                `${this.api_gateway_internal_url}/agent/${agentId}/agencyId`,
                { headers: { 'apikey': process.env.INTERNAL_API_KEY } }
            );

            console.log("Agency ID fetched:", response.data.agencyId);
            return response.data.agencyId;
        } catch (error) {
            console.error('Errore in getAgencyIdByAgentId:', error?.response?.data || error.message);
            return null;
        }


    }

}