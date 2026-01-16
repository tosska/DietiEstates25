import { Photo } from "../models/Database.js";
import path from "path";
import fs from "fs";

export class PhotoService {

    static directoryPhoto = "images/active";


    static async removeCurrentPhotosFromListing(listingId, listingFolder) {
        fs.rmdirSync(listingFolder, {recursive: true});

        Photo.destroy({where: {listingId: listingId}})

    }

    static async savePhotos(listingId, files, transaction=null) {

        const directory = path.join(this.directoryPhoto, listingId.toString());
    
        const listingFolder = path.join(process.cwd(), directory);
        if (!fs.existsSync(listingFolder)) {
            //recusive: true crea tutte le cartelle intermedie se non esistono
            fs.mkdirSync(listingFolder, { recursive: true }); 
        } else {
            await this.removeCurrentPhotosFromListing(listingId, listingFolder)
        }

        // Crea le foto in parallelo e raccogli i risultati
        const photoRecords = await Promise.all(
            files.map(async (file, index) => {
                const ext = path.extname(file.originalname);
                const filename = `img_${index + 1}${ext}`;
                const finalPath = path.join(listingFolder, filename);
                const relativePath = path.posix.join(directory, filename);

                // Sposta il file nella cartella definitiva
                fs.renameSync(file.path, finalPath);

                console.log(listingId);

                // Crea il record nel DB
                const photo = await Photo.create({
                    listingId,
                    url: relativePath,
                    order: index + 1,
                }, { transaction });

                return photo.url; // restituisce solo l’URL
            })
        );
        // Dopo che tutti i file sono stati spostati → rimuovo cartella temp
        const tempFolder = path.join(process.cwd(), this.directoryPhoto, "temp");
        if (fs.existsSync(tempFolder)) {
            fs.rmSync(tempFolder, { recursive: true, force: true });
        }

        console.log(photoRecords);
        return photoRecords;
    }


    static async getPhotosByListingIdAndSetUrl(listing_Id) {

        const baseUrl = 'http://localhost:3003'; //da cambiare

        let photos = await Photo.findAll({
            where: {listingId: listing_Id}
        })

        if (!photos || photos.length === 0) {
            console.warn(`[PhotoService] Nessuna foto trovata per listingId=${listing_Id}`);
            return [];
        }

        return photos.map(photo => ({
            ...photo.toJSON(),
            url: new URL(photo.url, baseUrl).href,
        }));

        
    }



}
