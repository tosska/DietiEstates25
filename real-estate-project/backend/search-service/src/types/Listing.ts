

export interface Address {

}

export interface Listing {
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
  createdAt: string;
  updatedAt: string;
  addressId: number;
  street: string;
  city: string;
  postalCode: string;
  state: string;
  unitDetail: string;
  longitude: number;
  latitude: number;
}

export interface ListingFilter {
  listing_type?: string;
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
}
  
  

export type AsyncCallbackListing = (data: Listing) => Promise<void>