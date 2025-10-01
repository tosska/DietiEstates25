import {Offer} from "../models/Database.js";
import { OfferService } from "../services/OfferService.js";

export class OfferController {

    static async getOfferById(req){
        return Offer.findByPk(req.params.offerId);
    }

    static async createOffer(req){
        let offer = Offer.build(req.body);
        offer.status = 'Pending';
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
 
                let offer = await Offer.findByPk(req.params.offerId);
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


    static async respondToOffer(req){
        return new Promise(async (resolve, reject) => {
            try {
                const offerResponse = req.body.response; 
                let offer = await Offer.findByPk(req.params.offerId);
                
                if (!offer) {
                    return reject(new Error('Offer not found'));
                }

                if (offer.status!="Pending"){
                    return reject(new Error('This offer has already been responded to'));
                }

                if(offerResponse !== 'Accepted' && offerResponse !== 'Rejected'){
                    return reject(new Error('Invalid response. Must be "Accepted" or "Rejected".'));
                }
    
                await Offer.update({status: offerResponse}, {where: {id: offer.id}});

                if(offerResponse === 'Accepted'){
                    OfferService.setAllOffersRejectedForListing(offer.listing_id);
                }
      
                resolve(offer);
            } catch (error) {
                reject(error);
            }
        }); 
    }


    //da migliorare
    static async getOfferHistoryForListing(req){

        let whereClause={};
    
        if(req.userRole=="customer") {
            whereClause= {listing_id: req.params.listingId,
                          customer_id: req.userId};

        } else if (req.userRole=="agent"){
            whereClause= {listing_id: req.params.listingId,
                          agent_id: req.userId};
        }

        return Offer.findAll({
            where: whereClause,
            order: [['offer_Date', 'ASC']] 
        })
    }

    static async getActiveOffersByAgent(req){
        return Offer.findAll({
            where: {
                agent_id: req.userId,
                status: "Pending"
            },
            order: [['listing_id', 'ASC'], ['offer_Date', 'ASC']] 
        })
    }

    static async getCountOfPendingOffersGroupListing(req){
        
        return Offer.count({
            where: {
                agent_id: req.userId,
                status: "Pending"
            },
            group: ['listing_id']
        })

    }

    static async getAllPendingOffersByListingId(req){

        return Offer.findAll({
            where: {
                listing_id: req.params.listingId,
                status: "Pending"
            },
            order: [['offer_Date', 'ASC']] 
        })

    }

}