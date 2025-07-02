import { MeiliSearchEngine } from "../models/MeiliListingSearchEngine";
import { FilterCondition } from "../types/Filter";
import { Listing } from "../types/Listing";
import { SearchDTO } from "../types/SearchDTO";
import { SearchEngine } from "../types/SearchEngine";
import { SearchOptions } from "../types/SearchOptions";



export class SearchController {

    static listingSearchEngine: SearchEngine<Listing>;

    static async searchListing(body: SearchDTO): Promise<Listing[]> {

        const query = body.query ?? "";
        const filters: FilterCondition[] = body.filters ?? [];
        const options: SearchOptions = body.options ?? {};

        return await this.listingSearchEngine.search(query, filters, options)

    }

}
