import axios from 'axios';

export class GeopifyClient {

    static api_geopify_url = process.env.GEOPIFY_API_URL ;
    static apiKey = process.env.GEOPIFY_API_KEY;

    static radiusMeters = 500; 

    //categorie interessate da cercare
    static categories = 'education.school,leisure.park,public_transport';

    //Mappa delle categorie
    static categoriesMap = [
        "education.school",
        "leisure.park",
        "public_trasport"
    ];

    
    static async getFeaturesNearByListing(lat, lon) {
        try {
            const response = await axios.get(this.api_geopify_url, {
                params: {
                    categories: categories,
                    // Il filtro 'circle' definisce l'area di ricerca: longitudine,latitudine,raggio
                    filter: `circle:${lon},${lat},${this.radiusMeters}`,
                    bias: `proximity:${lon},${lat}`,
                    limit: 20,
                    apiKey: apiKey
                }
            });

            const categories = response.data.features.categories;

            let tempSet = new Set();

            this.categoriesMap.forEach(key => {
                if(categories.includes(key)) tempSet.add(key);
            });
            
            return tempSet;
        } catch (error) {
            console.error("Errore Geoapify:", error.response?.data || error.message);
            throw error;
        }

    }


}