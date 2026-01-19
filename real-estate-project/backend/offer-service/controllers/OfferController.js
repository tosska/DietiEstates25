import { AuthClient } from "../clients/AuthClient.js";
import { CustomerClient } from "../clients/CustomerClient.js";
import { ListingClient } from "../clients/ListingClient.js";
import { Offer } from "../models/Database.js";
import { OfferService } from "../services/OfferService.js";
import { createError } from "../utils/errorUtils.js"; // Importazione della utility

export class OfferController {

    static async getOfferById(offerId) {
        return Offer.findByPk(offerId);
    }

    static async createOffer(offerData, userId, role) {
        console.log(role);
        if (role === "customer") {
            let lastestOffer = OfferService.getLatestOfferForCustomerAndListing(offerData.customer_id, offerData.listing_id);
            console.log("test",lastestOffer);
            if (lastestOffer && lastestOffer.status === "Pending") {
                // Errore di logica: offerta già esistente (Bad Request)
                throw createError("You already have a pending offer for this listing.", 400);
            }
        }

        let offer = Offer.build(offerData);
        offer.status = offerData?.status || "Pending";
        offer.offerDate = new Date();

        if (role === "customer") {
            offer.customer_id = userId;
        } else if (role === "agent") {
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
        if (!offer) {
            // Risorsa non trovata (Not Found)
            throw createError('Offer not found', 404);
        }
        await Offer.destroy({ where: { id: offer.id } });
        return offer;
    }

    static async respondToOffer(offerId, offerResponse, token) {
        let offer = await Offer.findByPk(offerId);
        if (!offer) {
            throw createError('Offer not found', 404);
        }
        
        if (offer.status !== "Pending") {
            throw createError('This offer has already been responded to', 400);
        }
        
        if (offerResponse !== 'Accepted' && offerResponse !== 'Rejected') {
            throw createError('Invalid offer response. Must be "Accepted" or "Rejected"', 400);
        }
        
        const [result] = await Offer.update({ status: offerResponse }, { where: { id: offer.id } });

        if (result === 0) {
            throw createError('Failed to update offer', 500);
        }

        if (offerResponse === 'Accepted') {
            await OfferService.setAllOffersRejectedForListing(offer.listing_id);
            ListingClient.closeListing(offer.listing_id, token);
        }

        return result;
    }

    static async createCounteroffer(offerId, counterOfferData, role) {
        console.log("Creating counteroffer for offer ID:", offerId);
        
        // La chiamata a respondToOffer gestirà internamente i createError se l'offerId non esiste o non è Pending
        await this.respondToOffer(offerId, 'Rejected');
        
        if (role === "customer") {
            counterOfferData.counteroffer = false;
        } else if (role === "agent") {
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
            const customer = customers.find(c => c.id === offer.customer_id);
            offer.customer = customer || null;
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
        
        if (role === "agent") {
            whereClause = { agent_id: userId };
        } else if (role === "customer") {
            whereClause = { customer_id: userId };
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
        let offers = await Offer.findAll({
            where: {
                listing_id: listingId,
                status: "Pending",
                counteroffer: false
            },
            order: [['offerDate', 'ASC']],
            raw: true
        });

        if (!offers || offers.length === 0) {
            return [];
        }

        const customerIds = offers.map(o => o.customer_id);
        let customers = await CustomerClient.getCustomersByIds(customerIds);
        const credentialsId = customers.map(c => c.credentialsId);

        let usersData = await AuthClient.getUserData(credentialsId);

        for (const offer of offers) {
            const customer = customers.find(c => c.id === offer.customer_id);
            if (customer) {
                const data = usersData.find(u => u.id === customer.credentialsId);
                customer.email = data ? data.email : null;
                offer.customer = customer;
            } else {
                offer.customer = null;
            }
        }

        return offers;
    }
}