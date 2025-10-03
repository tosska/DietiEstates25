import axios from 'axios';

export class AgencyClient {

    api_gatway_url = process.env.API_GATEWAY_URL || 'http://localhost:8000/agency-service';

    static async getAgentId(credential_id) {

        const response = axios.get(`${this.api_gatway_url}/intern/agent/${credential_id}/businessId`
            , { headers: { 'apikey': process.env.INTERNAL_API_KEY } }
        )

        return response.data.id;
    }

    static async getAdminId(credential_id) {

        return axios.get(`${this.api_gatway_url}/intern/admin/${credential_id}/businessId`
            , { headers: { 'apikey': process.env.INTERNAL_API_KEY } }
        )

    }





}