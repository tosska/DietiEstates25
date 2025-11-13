import axios from 'axios';

export class OfferClient {

    static api_gateway_url = process.env.API_GATEWAY_URL || 'http://localhost:8000/offer-service';
    static api_gateway_internal_url = process.env.API_GATEWAY_INTERNAL_URL || 'http://localhost:8000/offer-internal';
    
    static async getListingIdFromPendingOffer(token){


         try {
            const response = await axios.get(
                `${this.api_gateway_url}/offers/pending/listing-ids`,
                { headers: { Authorization: 'Bearer ' + token } } 
            );
            return response.data;
        }
        catch (error) {
            console.error('Errore in getListingIdFromPendingOffer:', error?.response?.data || error.message);
            throw error;
        }

    }


}