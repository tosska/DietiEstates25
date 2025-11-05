import { AgencyClient } from "../clients/AgencyClient.js";
import {Listing, Address, Photo, database} from "../models/Database.js";
import { ListingPublisher } from "../models/ListingPublisher.js";
import { PhotoService } from "../services/PhotoService.js";

export class ListingController {

    static async getListingById(req){
        const listingId = req.params.listingId;
        let listing = await Listing.findByPk(listingId, {
            include: [Address, Photo],
        });

        if(!listing){
            return new Error('Listing not found');
        }

        return listing;

        /*
        if(listing){
            const photos = await PhotoService.getPhotosByListingIdAndSetUrl(listingId);
            listing.dataValues.Photos = photos;
            return listing;
        }

        
        */
    }


    static async getListingsByIds(req){
        const listingIds = req.body.listingIds; // Assuming listing IDs are sent in the request body

        console.log("Fetching listings for IDs:", req.body);
        const listings = await Listing.findAll({
            where: { id: listingIds },
            include: [Address],
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

        await PhotoService.savePhotos(listingDB.id, req.files);

        await transaction.commit();
        
        //Rimuovo id da address in modo che non crei conflitto sul motore di ricerca (da spostare nel microservizio di ricerca)
        const {id, ...addressWithoutId} = addressDB.dataValues;
        const listingToPublish = {...listingDB.dataValues, ...addressWithoutId}
        ListingPublisher.publishCreated(listingToPublish);

        return listingDB;

    }



    //valutare un rectoring
    static async updateListing(req){
        return new Promise(async (resolve, reject) => {
            try {

                const transaction = await database.transaction();

                let listing = await Listing.findByPk(req.params.listingId);
 
                if (!listing) {
                    return reject(new Error('Listing not found'));
                }
                
                let updateFieldsListing = req.body?.listing;
                let updateFieldsAddress = req.body?.address;
                
                //in listing la chiave esterna address non va cambiata
                if(updateFieldsAddress)
                    await Address.update(updateFieldsAddress, {where: {id: listing.addressId}}, {transaction});
                
                if(updateFieldsListing)
                    await Listing.update(updateFieldsListing, {where: {id: listing.id}}, {transaction})
                
                await transaction.commit();

                const editListing = await Listing.findByPk(req.params.listingId, {include: [Address] });

                ListingPublisher.publishUpdated(editListing);

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
                await Address.destroy({where: {id: listing.addressId}}) //da valutare se cancellare anche address

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

        //mettere comando rabbitMQ

        return listing;

    }


    static async getListingsForAgent(req){
        return Listing.findAll({
            where: { agentId: req.userId},
            include: [Address, Photo]
        });
    }

    static async getActiveListingsForAgent(req){

        return Listing.findAll({
            where: { status: 'Active', agentId: req.userId},
            include: [Address, Photo]
        });
    }

    static async getClosedListingsForAgent(req){

        return Listing.findAll({
            where: { status: 'Closed', agentId: req.userId},
            include: [Address, Photo]
        });
    }



    static async getLatestListings(req){
        const limit = parseInt(req.query.limit) || 4; // Numero massimo di annunci da restituire, default 4

        return Listing.findAll({
            where: { status: 'Active' },
            include: [Address],
            order: [['publicationDate', 'DESC']],
            limit: limit
        });
    }

    


   
}