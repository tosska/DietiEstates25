

export interface Address {
  id: number;
  street: string;
  city: string;
  postalCode: string;
  state: string;
  unitDetail: string;
  longitude: number;
  latitude: number;
  createdAt: string;
  updatedAt: string;
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
  //Address: Address;
}

export type AsyncCallbackListing = (data: Listing) => Promise<void>