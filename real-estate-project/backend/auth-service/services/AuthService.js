import { AgencyClient } from '../clients/AgencyClient.js';
import { CustomerClient } from '../clients/CustomerClient.js';


export class AuthService {

    static async getBusinessId(credential_id, role) {

        let businessId = null;


        switch(role) {
            case 'admin':
                businessId = await AgencyClient.getAdminId(credential_id);
            break;
            case 'manager':
                businessId = await AgencyClient.getAdminId(credential_id);
            break;
            case 'agent':
                console.log("sono agente")
                businessId = await AgencyClient.getAgentId(credential_id);
            break;
            case 'customer':
                businessId = await CustomerClient.getCustomerId(credential_id);
            break;
        }

        console.log('Business ID ottenuto:', businessId);

        return businessId;
    }


}