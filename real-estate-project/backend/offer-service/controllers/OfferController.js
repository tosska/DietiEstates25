import {Offer} from "../models/Database.js";

export class OfferController {

    static async getOfferById(req){
        return Offer.findByPk(req.params.id);
    }

    static async createOffer(req){
        let offer = Offer.build(req.body);
        offer.offerDate = new Date();
        return offer.save();
    }

    static async updateOffer(req){
        return new Promise(async (resolve, reject) => {
            try {
 
                let { offerId, ...updateFields } = Offer.build(req.body);
                if (!offerId) {
                    return reject(new Error('Offer not found'));
                }
    
                await Offer.update(updateFields, {where: {id: offerId}})
      
                resolve(offerId);
            } catch (error) {
                reject(error);
            }
        }); 
    }

    static async deleteOffer(req){
        return new Promise(async (resolve, reject) => {
            try {
 
                let offer = await Offer.findByPk(req.params.id);
                if (!offer) {
                    return reject(new Error('Offer not found'));
                }
    
                await Offer.destroy({where: {id: offer.id}});
      
                resolve(offer);
            } catch (error) {
                reject(error);
            }
        }); 
    }


    //da rifare
    static async getOffersHistory(req){
        return Offer.findAll({
            where: {
                customer_id: req.customer_id,
                listing_id: req.listing_id,
                agent_id: req.agent_id
            },
            order: [['offer_Date', 'ASC']] 
        })
    }

    static async getActiveOffersForListingByAgent(req){
        return Offer.findAll({
            where: {
                listing_id: req.params.listingId,
                agent_id: req.params.agentId,
                status: "Pending"
            },
            order: [['offer_Date', 'ASC']] 
        })
    }

}