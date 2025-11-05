import axios from 'axios';

export class ListingClient {

    static api_gateway_url = process.env.API_GATEWAY_URL || 'http://localhost:8000/listing-service';
    static api_gateway_internal_url = process.env.API_GATEWAY_URL || 'http://localhost:8000/listing-internal';

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