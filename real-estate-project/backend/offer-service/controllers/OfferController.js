import { CustomerClient } from "../clients/CustomerClient.js";
import { ListingClient } from "../clients/ListingClient.js";
import {Offer} from "../models/Database.js";
import { OfferService } from "../services/OfferService.js";

export class OfferController {


    static async getOfferById(offerId) {
        return Offer.findByPk(offerId);
    }

    static async createOffer(offerData, userId, role) {
        let lastestOffer= OfferService.getLatestOfferForCustomerAndListing(offerData.customer_id, offerData.listing_id);

        if(lastestOffer.status === "Pending"){
            throw new Error("You already have a pending offer for this listing.");
        }

        let offer = Offer.build(offerData);
        offer.status = offerData?.status || "Pending";
        offer.offerDate = new Date();


        if(role === "customer"){
            offer.customer_id = userId;
        } else if(role === "agent"){
            offer.agent_id = userId;
        }

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

    static async createCounteroffer(offerId, counterOfferData, role) {

        console.log("Creating counteroffer for offer ID:", offerId);
        
        await this.respondToOffer(offerId, 'Rejected');
        
        if(role === "customer"){
            counterOfferData.counteroffer = false;
        } else if(role === "agent"){
            counterOfferData.counteroffer = true;
        }

        await this.createOffer(counterOfferData);
    }



    static async getOfferHistoryForListingByAgent(listingId, userId) {
     
        let offers = await Offer.findAll({
            where: { listing_id: listingId, agent_id: userId },
            order: [['offerDate', 'DESC']],
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

    static async getOfferHistoryForListingByCustomer(listingId, customerId) {

        return Offer.findAll({
            where: { listing_id: listingId, customer_id: customerId },
            order: [['offerDate', 'ASC']]
        });

    }

    static async getActiveOffersByAgent(agentId) {
        return Offer.findAll({
            where: {
                agent_id: agentId,
                status: "Pending"
            },
            order: [['listing_id', 'ASC'], ['offerDate', 'ASC']]
        });
    }

    static async getListingIdFromOffers(userId, role) {

        let whereClause;
        
        if(role === "agent"){
            whereClause = {
                agent_id: userId,
            };
        } else if(role === "customer"){
            whereClause = {
                customer_id: userId,
            };
        }

        let listingIds = await Offer.findAll({
            where: whereClause,
            attributes: ['listing_id'],
            group: ['listing_id']
        });
        return listingIds.map(offer => offer.listing_id);
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
            order: [['offerDate', 'ASC']]
        });
    }

    
}
