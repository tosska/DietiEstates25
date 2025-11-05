import { CustomerClient } from "../clients/CustomerClient.js";
import { ListingClient } from "../clients/ListingClient.js";
import {Offer} from "../models/Database.js";
import { OfferService } from "../services/OfferService.js";

export class OfferController {


    static async getOfferById(offerId) {
        return Offer.findByPk(offerId);
    }

    static async createOffer(offerData) {
        let offer = Offer.build(offerData);
        offer.status = offerData?.status || "Pending";
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

    static async respondToOffer(offerId, offerResponse, token) {
        let offer = await Offer.findByPk(offerId);
        if (!offer) throw new Error('Offer not found');
        if (offer.status !== "Pending") throw new Error('This offer has already been responded to');
        if (offerResponse !== 'Accepted' && offerResponse !== 'Rejected') {
            throw new Error('Invalid response. Must be "Accepted" or "Rejected".');
        }
        await Offer.update({ status: offerResponse }, { where: { id: offer.id } });
        if (offerResponse === 'Accepted') {
            await OfferService.setAllOffersRejectedForListing(offer.listing_id);
            ListingClient.closeListing(offer.listing_id, token);
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

        let offers = await Offer.findAll({
            where: whereClause,
            order: [['offer_Date', 'DESC']],
            raw: true
        });

        const customerIds = offers.map(o => o.customer_id);

        let customers = await CustomerClient.getCustomersByIds(customerIds);

        for (const offer of offers) {
            // Trova il cliente corrispondente cercando per ID
            const customer = customers.find(c => c.id === offer.customer_id);

            // Aggiungilo all'offerta (se trovato)
            if (customer) {
                offer.customer = customer;
            } else {
                offer.customer = null; // nel caso non venga trovato
            }
        }

        console.log("Offer history with customer details:", offers);
    
        return offers;

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
                status: "Pending",
                counteroffer: false
            },
            group: ['listing_id']
        });
    }

    static async getAllPendingOffersByListingId(listingId) {
        return Offer.findAll({
            where: {
                listing_id: listingId,
                status: "Pending",
                counteroffer: false
            },
            order: [['offer_Date', 'ASC']]
        });
    }
}
