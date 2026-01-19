
import { FilterCondition } from "../types/Filter";
import { ListingToIndex, ListingFilter } from "../types/Listing";
import { GeoFilter} from "../types/GeoFilter";
import { SearchEngine } from "../types/SearchEngine";
import { Utils } from "../models/Utils.js";



export class SearchController {

    static listingSearchEngine: SearchEngine<ListingToIndex>;


    static async searchListing(body: ListingFilter): Promise<ListingToIndex[]> {

        let geoFilter: GeoFilter | undefined;
        let latitude: number | undefined;
        let longitude: number | undefined;  
        
        //Se l'utente ha mandato dei filtri geografici
        //Definisco un rettangolo con centro la coordinata mandata dall'utente
        if(this.hasGeoFilter(body)) {
            latitude = Utils.convertVarToNumber(body.latitude);
            longitude = Utils.convertVarToNumber(body.longitude);
            geoFilter = Utils.getBoundingBox(latitude!, longitude!, body.radiusKm!);
        }

        console.log("Ho superato la prima fase godo: geoFilter", geoFilter);

        //Costruisco i filtri, convertendoli nel tipo FilterCondition definito dal dominio del microservizio
        //Se mando filtri geografici, otterrò gli annunci situati nel rettangolo prima definito
        let filters: FilterCondition[] = Utils.convertListingFilterToGenericFilter(body, geoFilter);


        //effettuo la ricerca applicando i filtri
        let result = await this.listingSearchEngine.search("", filters);

        //Se l'utente ha mandato dei filtri geografici
        //Filtro gli annunci localizzati nel rettangolo per il raggio mandatomi dall'utente (da rettangolo diventa circonferenza)
        if(this.hasGeoFilter(body)){
            return this.setRadiusFilterOnResult(result, latitude!, longitude!, body.radiusKm!);
        }

        return result;
        
    }

    private static hasGeoFilter(filter: ListingFilter){
        return filter.radiusKm && filter.longitude && filter.latitude
    }

    private static setRadiusFilterOnResult(result: ListingToIndex[], lat: number, lng: number, radiusKm: number): ListingToIndex[]{
        return result.filter((listing: ListingToIndex) => {
                console.log("Listing: ", listing);
                const d = Utils.haversine(lat, lng, listing.latitude, listing.longitude);
                return d <= radiusKm;
            });

    }




}

