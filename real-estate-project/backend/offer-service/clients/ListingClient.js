import axios from 'axios';

export class ListingClient {

    static BASE_URL = process.env.API_GATEWAY_URL || 'http://localhost:8000'

    static api_gateway_url = `${this.BASE_URL}/listing-service`;
    static api_gateway_internal_url = `${this.BASE_URL}/listing-internal`;

    static async closeListing(listingId, token) {

        try {
            const response = await axios.put(
                `${this.api_gateway_url}/listing/${listingId}/closing`,
                {}, 
                { headers: { Authorization: 'Bearer ' + token } } 
            );
            return response.data;
        }
        catch (error) {
            console.error('Errore in closeListing:', error?.response?.data || error.message);
            throw error;
        }

    }


}