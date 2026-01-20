import axios from 'axios';

export class OfferClient {

    static BASE_URL = process.env.API_GATEWAY_URL || 'http://localhost:8000';

    static api_gateway_url = `${this.BASE_URL}/offer-service`;
    static api_gateway_internal_url = `${this.BASE_URL}/offer-internal`;
    
    static async getListingIdFromOffers(token){


         try {
            const response = await axios.get(
                `${this.api_gateway_url}/offers/all/listing-ids`,
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