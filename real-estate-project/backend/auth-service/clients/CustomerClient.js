import axios from 'axios';

export class CustomerClient {

    static BASE_GATEWAY = process.env.API_GATEWAY_URL || 'http://localhost:8000';

    // 2. RICOSTRUZIONE AUTOMATICA: Aggiungiamo i suffissi
    static api_gateway_url = `${this.BASE_GATEWAY}/customer-service`;
    static api_gateway_internal_url = `${this.BASE_GATEWAY}/customer-internal`;
    
    static direct_url = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3002'; 
    // --------------------

    static async getCustomerId(credential_id) {
        console.log(process.env.INTERNAL_API_KEY);
        try {
            const response = await axios.get(
                `${this.api_gateway_internal_url}/customer/${credential_id}/businessId`,
                { headers: { 'apikey': process.env.INTERNAL_API_KEY } }
            );
            return response.data.id;
        } catch (error) {
            console.error('Errore in getCustomerId:', error?.response?.data || error.message);
            return null;
        }
    }

    /**
     * Crea un nuovo Cliente su customer-service
     */
    static async createCustomer(customerData) {
        try {
            // URL originale: http://localhost:3002/customers
            const response = await axios.post(`${this.direct_url}/customers`, customerData, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000 // Timeout 10s
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw new Error(error.response?.data?.message || 'Errore creazione Customer');
        }
    }
}