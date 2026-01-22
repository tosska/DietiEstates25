import { AgencyClient } from "../clients/AgencyClient.js";
import { OfferClient } from "../clients/OfferClient.js";
import {Listing, Address, Photo, Category, database, PropertyType} from "../models/Database.js";
import { ListingPublisher } from "../models/ListingPublisher.js";
import { ListingService } from "../services/ListingService.js";
import { PhotoService } from "../services/PhotoService.js";

export class ListingController {

    static async getListingById(req){
        const listingId = req.params.listingId;
        let listing = await Listing.findByPk(listingId, {
            include: [Address, Photo, 
            {
                model: Category,
                attributes: ['name'], 
                through: { attributes: [] } 
            }, 'propertyType'
            
        ],
        order: [[Photo, 'order', 'ASC']]
        });

        if(!listing){
            const error = new Error('Listing not found');
            error.status = 404;
            throw error;
        }

        return listing;


    }


    static async getListingsByIds(req){
        const listingIds = req.body.listingIds; // Assuming listing IDs are sent in the request body

        console.log("Fetching listings for IDs:", req.body);
        const listings = await Listing.findAll({
            where: { id: listingIds },
            include: [Address, Photo, 'propertyType'],
        });

        return listings;
    }

    static async createListing(req){

        const dataParse = JSON.parse(req.body.listingData); 
        const {address, ...listingData } = dataParse;
        
        const transaction = await database.transaction();

        listingData.publicationDate = new Date();
        listingData.status = "Active";
        listingData.agentId = req.userId;
        listingData.agencyId = await AgencyClient.getAgencyIdByAgentId(listingData.agentId);

        console.log(listingData.agencyId)

        
        const addressDB = await Address.create(address, {transaction});
        
        const listingDB = await Listing.create(
            {...listingData, addressId: addressDB.id }, 
            { transaction }
        );

        let listingPhotos = await PhotoService.savePhotos(listingDB.id, req.files, transaction);
        console.log("Photos saved for listing:", listingPhotos);

        await transaction.commit();

        const categories = await ListingService.saveCategoriesOnListing(listingDB, 
            addressDB.dataValues.latitude, 
            addressDB.dataValues.longitude
        );
        const propertyType = await PropertyType.findByPk(listingDB.propertyTypeId);
    
        listingDB.dataValues.Address = addressDB;
        const listingToPublish = {...listingDB.dataValues, propertyType: propertyType.name, mainPhoto: listingPhotos[0], categories: categories || null};
        ListingPublisher.publishCreated(listingToPublish);

        return listingDB;

    }


    static async updateListing(req){
        return new Promise(async (resolve, reject) => {
            try {
                let listingPhotos = {};
                const dataParse = JSON.parse(req.body.listingData); 
                const listingId = req.params.listingId;

                const transaction = await database.transaction();

                let listing = await Listing.findByPk(listingId);
 
                if (!listing) {
                    await transaction.rollback();
                    return reject(new Error('Listing not found'));
                }
                
                let updateFieldsListing = dataParse;
                let updateFieldsAddress = dataParse.address;
                
                //in listing la chiave esterna address non va cambiata
                if(updateFieldsAddress) {
                    await Address.update(updateFieldsAddress, {where: {id: listing.addressId}}, {transaction});
                    await ListingService.saveCategoriesOnListing(
                        listing, 
                        updateFieldsAddress.latitude, 
                        updateFieldsAddress.longitude
                    ); 
                }
                
                if(updateFieldsListing) {
                    await Listing.update(updateFieldsListing, {where: {id: listing.id}}, {transaction})
                }

                if(req.files) {
                    listingPhotos = await PhotoService.savePhotos(listingId, req.files, transaction);
                }
                
                await transaction.commit();

                let editListing = await Listing.findByPk(req.params.listingId, {include: [Address, Category, 'propertyType'] });
                console.log("annuncio modificato", editListing.dataValues);
                editListing.dataValues.propertyType = editListing.propertyType.name;
                let editListingToPublish = {};
                
                editListingToPublish = {...editListing.dataValues, mainPhoto: listingPhotos[0] || ''};
            
                ListingPublisher.publishUpdated(editListingToPublish);

                //aggiustare il ritorno
                resolve(editListing);
            } catch (error) {
                reject(error);
            }
        }); 
    }

    static async deleteListing(req){
        return new Promise(async (resolve, reject) => {
            try {
 
                let listing = await Listing.findByPk(req.params.listingId);
                if (!listing) {
                    return reject(new Error('Listing not found'));
                }
    
                await Listing.destroy({where: {id: listing.id}});
                await Address.destroy({where: {id: listing.addressId}}) 

                ListingPublisher.publishDeleted(listing.id);
      
                resolve(listing);
            } catch (error) {
                reject(error);
            }
        }); 
    }


    static async closeListing(req){

        const listingId=req.params.listingId;
        const listing = await Listing.findByPk(listingId);

        if(!listing){
            return new Error('Listing not found');
        }

        if(listing.status === "Closed"){
            return new Error('Listing is already closed');
        }

        listing.status="Closed";
        listing.save();

        
        return listing;

    }


    static async getListingsForAgent(req){
        return Listing.findAll({
            where: { agentId: req.userId},
            include: [Address, Photo],
            order: [[Photo, 'order', 'ASC']]
        });
    }

    static async getActiveListingsForAgent(req){

        return Listing.findAll({
            where: { status: 'Active', agentId: req.userId},
            include: [Address, Photo],
            order: [[Photo, 'order', 'ASC']]
        });
    }

    static async getClosedListingsForAgent(req){

        return Listing.findAll({
            where: { status: 'Closed', agentId: req.userId},
            include: [Address, Photo],
            order: [[Photo, 'order', 'ASC']]
        });
    }

    static async getActiveListingsOfferedByCustomer(req) {

        console.log("Fetching listings offered by customer with token:", req.token);
        const listingIds = await OfferClient.getListingIdFromOffers(req.token);

        return Listing.findAll({
            where: { id: listingIds, status: 'Active' },
            include: [Address, Photo],
            order: [[Photo, 'order', 'ASC']]
        });
    }

    static async getClosedListingsOfferedByCustomer(req) {

        console.log("Fetching listings offered by customer with token:", req.token);
        const listingIds = await OfferClient.getListingIdFromOffers(req.token);

        return Listing.findAll({
            where: { id: listingIds, status: 'Closed' },
            include: [Address, Photo],
            order: [[Photo, 'order', 'ASC']]
        });
    }

    static async getLatestListings(req){
        const limit = parseInt(req.query.limit) || 4; // Numero massimo di annunci da restituire, default 4

        return Listing.findAll({
            where: { status: 'Active' },
            include: [Address, Photo],
            order: [['publicationDate', 'DESC'],
                    [Photo, 'order', 'ASC']],
            limit: limit
        });
    }

    static async getPropertyTypes(){

        return PropertyType.findAll();

    }

    


   
}