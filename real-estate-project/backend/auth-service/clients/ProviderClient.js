import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

const google_client_id = '1041047449432-rpas3r2v1k32uhqgl9n99pl79bvsdi3d.apps.googleusercontent.com';
const facebook_client_id = '1593929541736069';
const client = new OAuth2Client(google_client_id);


export class ProviderClient {


    static async validateSocialToken(providerName, idToken) {
        switch(providerName) {
            case 'GOOGLE':
                return await this.#validateGoogleToken(idToken);
            case 'FACEBOOK':
                return await this.#validateFacebookToken(idToken);
            default:
                throw new Error('Provider non supportato');
        }
    }


    static async #validateGoogleToken(idToken) {
        try {
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: google_client_id,
            });

            const payload = ticket.getPayload();
            // Payload contiene: email, sub (providerId), given_name, family_name
            return payload;
        } catch (error) {
            throw new Error('Token Google non valido');
        }
    }

    static async #validateFacebookToken(idToken) {

        try {
            // Facebook richiede di specificare i campi desiderati nel parametro 'fields'
            const response = await axios.get('https://graph.facebook.com/me', {
                params: {
                    fields: 'id,email,first_name,last_name',
                    access_token: idToken
                }
            });

            const data = response.data; // Axios mette il body della risposta in .data

            return {
                email: data.email,
                sub: data.id, // ID utente univoco (App-Scoped ID)
            };
        } catch (error) {
            // Gestione errori migliorata con Axios
            const errorMsg = error.response?.data?.error?.message || 'Errore validazione Facebook';
            console.error("Errore Facebook API:", errorMsg);
            throw new Error(errorMsg);
        }
    }


}
    

