import axios from 'axios';

export class CustomerClient {

    static api_gateway_url = process.env.API_GATEWAY_URL || 'http://localhost:8000/customer-service';
    static api_gateway_internal_url = process.env.API_GATEWAY_URL || 'http://localhost:8000/customer-internal';

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


}