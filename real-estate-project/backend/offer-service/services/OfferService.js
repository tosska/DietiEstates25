import {Offer} from "../models/Database.js";

export class OfferService {

    static async setAllOffersRejectedForListing(listingId) {

        if (!listingId) {
            throw new Error("Listing ID is required");
        }

        await Offer.update(
            { status: 'Rejected' },
            {
                where: {
                    listing_id: listingId,
                    status: 'Pending'
                }
            }
        );

    }

    static getLatestOfferForCustomerAndListing(customerId, listingId) {
        return Offer.findOne({
            where: {
                customer_id: customerId,
                listing_id: listingId
            },
            order: [['offerDate', 'DESC']]
        });
    }


}