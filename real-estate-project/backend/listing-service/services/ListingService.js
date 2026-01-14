
import { Category, database} from "../models/Database.js";
import { GeopifyClient } from "../clients/GeopifyClient.js";

export class ListingService {

    static mapping = {
        'education.school': 'school',
        'leisure.park': 'park',
        'public_transport': 'public_trasport'
    };


    static async saveCategoriesOnListing(listing) {

    try {
        // Recuperiamo le coordinate dal listing (assumendo siano presenti)
        const { latitude, longitude } = listing.dataValues;

        if (!latitude || !longitude) {
            throw new Error("Coordinate geografiche mancanti per l'arricchimento.");
        }

        const categoryNames = await this.#getListingCategories(latitude, longitude);

        if (categoryNames.length === 0) {
            console.warn(`Nessuna categoria trovata per il listing ${listing.id}`);
            return; //nulla da associare
        }

        const categoriesInDb = await Category.findAll({
            where: { name: categoryNames }
        });

        await listing.setCategories(categoriesInDb);
        
    } catch (error) {
        console.error(`[ListingService Error]: ${error.message}`);
        // Rilanciamo l'errore affinché il controller possa vederlo
        throw error; 
    }
}



    static async #getListingCategories(latitude, longitude) {

        let categoriesFromExtern = await GeopifyClient.getFeaturesNearByListing(latitude, longitude);

        let categoriesArray = [];

        categoriesFromExtern.forEach(cat => {

            categoriesArray.push(this.mapping[cat]);

        });

        return categoriesArray;

    }





}