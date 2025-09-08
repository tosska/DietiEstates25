import {Listing, Address, database} from "../models/Database.js";
import { ListingPublisher } from "../models/ListingPublisher.js";

export class ListingController {

    static async getListingById(req){
        return Listing.findByPk(req.params.listingId, 
            {include: [Address] }
        );
    }

    static async createListing(req){

        const body = req.body;
        const transaction = await database.transaction();
        
        const address = await Address.create(body.address, {transaction});
        
        const listing = await Listing.create(
            {...body.listing, addressId: address.id }, 
            { transaction }
        );

        await transaction.commit();
        

        //Rimuovo id da address in modo che non crei conflitto sul motore di ricerca (da spostare nel microservizio di ricerca)
        const {id, ...addressWithoutId} = address.dataValues;
        const listingToPublish = {...listing.dataValues, ...addressWithoutId}
        ListingPublisher.publishCreated(listingToPublish);

        return listing;

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


   
}