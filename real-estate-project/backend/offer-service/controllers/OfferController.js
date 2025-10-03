import {Offer} from "../models/Database.js";
import { OfferService } from "../services/OfferService.js";

export class OfferController {


    static async getOfferById(offerId) {
        return Offer.findByPk(offerId);
    }

    static async createOffer(offerData) {
        let offer = Offer.build(offerData);
        offer.status = 'Pending';
        offer.offerDate = new Date();
        return offer.save();
    }

    static async updateOffer(offerId, updateFields) {
        await Offer.update(updateFields, { where: { id: offerId } });
        return offerId;
    }

    static async deleteOffer(offerId) {
        let offer = await Offer.findByPk(offerId);
        if (!offer) throw new Error('Offer not found');
        await Offer.destroy({ where: { id: offer.id } });
        return offer;
    }

    static async respondToOffer(offerId, offerResponse) {
        let offer = await Offer.findByPk(offerId);
        if (!offer) throw new Error('Offer not found');
        if (offer.status !== "Pending") throw new Error('This offer has already been responded to');
        if (offerResponse !== 'Accepted' && offerResponse !== 'Rejected') {
            throw new Error('Invalid response. Must be "Accepted" or "Rejected".');
        }
        await Offer.update({ status: offerResponse }, { where: { id: offer.id } });
        if (offerResponse === 'Accepted') {
            OfferService.setAllOffersRejectedForListing(offer.listing_id);
        }
        return offer;
    }

    static async createCounteroffer(offerId, counterOfferData) {

        console.log("Creating counteroffer for offer ID:", offerId);
        
        this.respondToOffer(offerId, 'Rejected');
        
        counterOfferData.counteroffer = true;

        this.createOffer(counterOfferData);
    }

    static async getOfferHistoryForListing(listingId, userRole, userId) {
        let whereClause = {};
        if (userRole === "customer") {
            whereClause = { listing_id: listingId, customer_id: userId };
        } else if (userRole === "agent") {
            whereClause = { listing_id: listingId, agent_id: userId };
        }
        return Offer.findAll({
            where: whereClause,
            order: [['offer_Date', 'ASC']]
        });
    }

    static async getActiveOffersByAgent(agentId) {
        return Offer.findAll({
            where: {
                agent_id: agentId,
                status: "Pending"
            },
            order: [['listing_id', 'ASC'], ['offer_Date', 'ASC']]
        });
    }

    static async getCountOfPendingOffersGroupListing(agentId) {
        return Offer.count({
            where: {
                agent_id: agentId,
                status: "Pending"
            },
            group: ['listing_id']
        });
    }

    static async getAllPendingOffersByListingId(listingId) {
        return Offer.findAll({
            where: {
                listing_id: listingId,
                status: "Pending"
            },
            order: [['offer_Date', 'ASC']]
        });
    }
}
