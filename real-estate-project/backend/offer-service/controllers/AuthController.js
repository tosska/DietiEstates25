import {Offer} from "../models/Database.js";

export class AuthController {

    static async canUserModifyOffer(offerId, userId, userRole){

        const offer = await Offer.findByPk(offerId);

        //console.log(offer);

        if (!offer) {
            throw new Error("Offer not found");
        }

        if(userRole == "customer"){
            return offer.customer_id === userId;
        }else{
            return false;
        }
    }

    static async canUserAccessOffer(offerId, userId, userRole){

        const offer = await Offer.findByPk(offerId);

        if (!offer) {
            throw new Error("Offer not found");
        }

        if(userRole == "customer"){
            return offer.customer_id == userId && offer.counteroffer;
        }else if(userRole == "agent"){
            return (offer.agent_id == userId && !offer.counteroffer);
        }

        return false;
    }


}