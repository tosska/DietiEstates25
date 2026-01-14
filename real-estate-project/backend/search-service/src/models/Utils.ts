import { parse } from "path";
import { FilterCondition } from "../types/Filter";
import { GeoFilter } from "../types/GeoFilter";
import { ListingFilter } from "../types/Listing";

export class Utils {


    public static convertListingFilterToGenericFilter(filter: ListingFilter, geoFilter?: GeoFilter): FilterCondition[] {
        if (!filter) {
            return [];
        }
        const filtersCondition: FilterCondition[] = [];

        const mappings: [keyof ListingFilter, string, '=' | '>=' | '<='][] = [
            ['listing_type', 'listingType', '='],
            ['number_rooms', 'numberRooms', '='],
            ['min_area', 'area', '>='],
            ['max_area', 'area', '<='],
            ['min_price', 'price', '>='],
            ['max_price', 'price', '<='],
            ['construction_year_after', 'constructionYear', '>='],
            ['construction_year_before', 'constructionYear', '<='],
            ['energyClass', 'energyClass', '='],
            ['street', 'street', '='],
            ['city', 'city', '='],
            ['state', 'state', '='],
            ['postalCode', 'postalCode', '='],
            ['country', 'country', '='],
            ['unitDetail', 'unitDetail', '='],            
        ];

        for (const [key, field, operator] of mappings) {
            const value = filter[key];
            if (value !== undefined && value !== null) {
                filtersCondition.push({ field, operator, value });
            }
        }

        if(geoFilter){
            this.setGeoFilter(geoFilter, filtersCondition);
        }

        return filtersCondition;
    }

    private static setGeoFilter(geoFilter: GeoFilter, filtersCondition: FilterCondition[]) {

        filtersCondition.push(
                { field: 'latitude', operator: '>=', value: geoFilter.min_latitude },
                { field: 'latitude', operator: '<=', value: geoFilter.max_latitude },
                { field: 'longitude', operator: '>=', value: geoFilter.min_longitude },
                { field: 'longitude', operator: '<=', value: geoFilter.max_longitude }   
        )
    }


    public static getBoundingBox(lat: number, lng: number, radiusKm: number) : GeoFilter {
         // Funzione helper per arrotondare
        const round = (val: number) => {console.log(val); return parseFloat(val.toFixed(3))};
        const earthRadius = 6371;

        const latDelta = radiusKm / earthRadius * (180 / Math.PI);
        const lngDelta = radiusKm / (earthRadius * Math.cos(lat * Math.PI / 180)) * (180 / Math.PI);

        console.log(`lat: ${lat}, lng: ${lng}, radiusKm: ${radiusKm}`);
        console.log(`latDelta: ${latDelta}, lngDelta: ${lngDelta}`);


        return {
            min_latitude: round(lat - latDelta),
            max_latitude: round(lat + latDelta),
            min_longitude: round(lng - lngDelta),
            max_longitude: round(lng + lngDelta)
        };

    }

    public static haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180; //calcolo differenza tra i due punti e conversione in radianti
        const dLon = (lon2 - lon1) * Math.PI / 180; //calcolo differenza tra i due punti e conversione in radianti
        const a = Math.sin(dLat/2)**2 +
                    Math.cos(lat1 * Math.PI / 180) *
                    Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon/2)**2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); //calcolo della distanza angolare
        return R * c; //Moltiplico la distanza angolare con il raggio della terra per ottenere la distanza in km
    }


    public static convertVarToNumber(value: any): number | undefined {
        if (value === undefined || value === null) {
            return undefined;
        }
        const num = Number(value);
        return isNaN(num) ? undefined : num;
    }



}