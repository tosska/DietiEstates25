import { ListingSearchIndex } from "../models/ListingSearchIndex.js";
import { SearchCriteria } from "../models/SearchCriteria.js";


export class SearchController {

    static async searchListing(req){

        const query = req.body.query;

        const criteria = new SearchCriteria(query);

        return ListingSearchIndex.search(criteria);
    }

}