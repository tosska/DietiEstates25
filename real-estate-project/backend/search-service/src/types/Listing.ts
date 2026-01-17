

export interface IncomingListing {
id: number;
  title: string;
  price: number;
  listingType: string;
  status: string;
  description: string;
  area: number;
  numberRooms: number;
  propertyType: string;
  constructionYear: number;
  energyClass: string;
  agencyId: number;
  agentId: number;
  addressId: number;
  
  // Date (possono arrivare come stringhe ISO o oggetti Date)
  publicationDate?: string | Date;
  endPublicationDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;

  // Relazioni Annidate (da appiattire)
  Address: {
    id: number;
    street: string;
    houseNumber: string,
    city: string;
    state: string;
    country: string;
    unitDetail: string;
    postalCode: string;
    longitude: number;
    latitude: number;
  };

  // Foto (array di oggetti)
  mainPhoto: string;

  // Categorie (spesso array di oggetti o stringhe)
  categories?: string[];
}



export interface ListingToIndex {
  id: number;
  title: string;
  price: number;
  listingType: string;
  status: string;
  publicationDate: string;
  endPublicationDate: string;
  description: string;
  area: number;
  numberRooms: number;
  propertyType: string;
  constructionYear: number;
  energyClass: string;
  agencyId: number;
  agentId: number;
  addressId: number;
  street: string;
  city: string;
  country: string;
  postalCode: string;
  state: string;
  unitDetail: string;
  longitude: number;
  latitude: number;
  mainPhoto: string;
  categories?: string[];
}

export interface ListingFilter {
  listing_type?: string;
  propertyType?: string;
  number_rooms?: number;
  min_area?: number;
  max_area?: number;
  min_price?: number;
  max_price?: number;
  construction_year_before?: number;
  construction_year_after?: number;
  energyClass?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  unitDetail?: string;
  longitude?: number;
  latitude?: number;
  radiusKm?: number; // Optional for geo search
  categories: string[];
}
  
  

export type AsyncCallbackListing = (data: ListingToIndex) => Promise<void>