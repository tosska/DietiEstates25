import axios from 'axios';

export class CustomerClient {

    static BASE_URL = process.env.API_GATEWAY_URL || 'http://localhost:8000';

    static api_gateway_url = `${this.BASE_URL}/customer-service`;
    static api_gateway_internal_url = `${this.BASE_URL}/customer-internal`;


    static async getCustomersByIds(customerIds) {

        try {
            const response = await axios.post(
                `${this.api_gateway_internal_url}/customers/by-ids`,
                { customerIds }, 
                { headers: { apikey: process.env.INTERNAL_API_KEY } } 
            );

            return response.data;
        } catch (error) {
            console.error('Errore in getCustomersByIds:', error?.response?.data || error.message);
            return [];
        }
    }


}