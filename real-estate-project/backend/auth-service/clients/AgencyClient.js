import axios from 'axios';

export class AgencyClient {

    static BASE_GATEWAY = process.env.API_GATEWAY_URL || 'http://localhost:8000';


    static api_gateway_url = `${this.BASE_GATEWAY}/agency-service`;
    static api_gateway_internal_url = `${this.BASE_GATEWAY}/agency-internal`;

    static direct_url = process.env.AGENCY_SERVICE_URL || 'http://localhost:3000';

    // --- METODI DI CONSULTAZIONE (ESISTENTI) ---

    static async getAgentId(credential_id) {
        try {
            const response = await axios.get(
                `${this.api_gateway_internal_url}/agent/${credential_id}/businessId`,
                { headers: { 'apikey': process.env.INTERNAL_API_KEY } }
            );
            return response.data.id;
        } catch (error) {
            console.error('Errore in getAgentId:', error?.response?.data || error.message);
            return null;
        }
    }

    static async getAdminId(credential_id) {
        try {
            const response = await axios.get(
                `${this.api_gateway_internal_url}/admin/${credential_id}/businessId`,
                { headers: { 'apikey': process.env.INTERNAL_API_KEY } }
            );
            return response.data.id;
        } catch (error) {
            console.error('Errore in getAdminId:', error?.response?.data || error.message);
            return null;
        }
    }

    // --- NUOVI METODI (SPOSTATI DAL CONTROLLER) ---

    /**
     * Crea un Agente chiamando agency-service (via Gateway)
     */
    static async createAgent(token, agentData) {
        try {
            // URL originale: http://localhost:8000/agency-service/agents
            const response = await axios.post(`${this.api_gateway_url}/agents`, agentData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token // Inoltra il token
                }
            });
            return response.data;
        } catch (error) {
            // Rilancia l'errore pulito
            throw new Error(error.response?.data?.message || error.response?.statusText || 'Errore creazione Agente');
        }
    }

    /**
     * Crea un Admin chiamando agency-service (via Gateway)
     */
    static async createAdmin(token, adminData) {
        try {
            // URL originale: http://localhost:8000/agency-service/admins
            const response = await axios.post(`${this.api_gateway_url}/admins`, adminData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.response?.statusText || 'Errore creazione Admin');
        }
    }

    /**
     * Crea un Manager chiamando agency-service (Diretto)
     */
    static async createManager(token, managerData) {
        try {
            // URL originale: http://localhost:3000/manager
            const response = await axios.post(`${this.direct_url}/manager`, managerData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Errore creazione Manager');
        }
    }

    /**
     * Configura l'Agenzia e il Manager in un colpo solo (Diretto)
     */
    static async setupAgency(agencyData) {
        try {
            // URL originale: http://localhost:3000/agency (oppure /internal/setup-agency se l'hai cambiato)
            // Mantengo /agency come nel tuo codice caricato
            const response = await axios.post(`${this.direct_url}/agency`, agencyData, {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Errore setup Agenzia');
        }
    }
}