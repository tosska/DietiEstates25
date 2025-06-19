export class SearchCriteria {

    constructor(query) {
        this.query = query;
        this.filters = [];
    }

    toMeilisearchFilter() {
        
        const q = this.query;
    
        //listing
        this.addFilter("propertyType", q.propertyType);
        this.addFilter("propertyType", q.propertyType);


        if (q.property_type) filters.push(`property_type = "${q.property_type}"`);
        if (q.listing_type) filters.push(`listing_type = "${q.listing_type}"`);
        if (q.number_rooms) filters.push(`number_rooms >= ${parseInt(q.number_rooms)}`);
        if (q.min_area) filters.push(`area >= ${parseFloat(q.min_area)}`);
        if (q.max_area) filters.push(`area <= ${parseFloat(q.max_area)}`);
        if (q.min_price) filters.push(`price >= ${parseFloat(q.min_price)}`);
        if (q.max_price) filters.push(`price <= ${parseFloat(q.max_price)}`);
        if (q.construction_year_before) filters.push(`construction_year <= ${parseInt(q.construction_year_before)}`);
        if (q.construction_year_after) filters.push(`construction_year >= ${parseInt(q.construction_year_after)}`);
        if (q.energyClass) filters.push(`energyClass = "${q.energyClass}"`);

        //address
        if (q.street) filters.push(`address.street = "${q.street}"`);
        if (q.city) filters.push(`address.city = "${q.city}"`);
        if (q.state) filters.push(`address.state = "${q.state}"`);
        if (q.postalCode) filters.push(`address.postalCode = "${q.postalCode}"`);
        if (q.unitDetail) filters.push(`address.state = "${q.unitDetail}"`);

        return filters.join(' AND ');
    }

    addFilter(filter, value, type = "eq") {
        if (value === undefined || value === null || value === "") {
        return; // salta se il valore è vuoto
        }

        switch (type) {
        case "eq":
            filters.push(`${filter} = "${value}"`);
            break;
        case "gt":
            filters.push(`${filter} >= ${value}`);
            break;
        case "lt":
            filters.push(`${filter} <= ${value}`);
            break;
        default:
            throw new Error(`Unsupported filter type: ${type}`);
        }
    };

}
