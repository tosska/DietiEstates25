import { Photo } from "../models/Database.js";
import path from "path";
import fs from "fs";

export class PhotoService {

    static directoryPhoto = "images/active";

    static async savePhotos(listingId, files) {

        const directory = path.join(this.directoryPhoto, listingId.toString());

        const listingFolder = path.join(process.cwd(), directory);
        if (!fs.existsSync(listingFolder)) {
            //recusive: true crea tutte le cartelle intermedie se non esistono
            fs.mkdirSync(listingFolder, { recursive: true }); 
        }

        files.forEach(async (file, index) => {
            const ext = path.extname(file.originalname); 
            const filename = 'img_' + String(index+1) + ext;
        
            const finalPath = path.join(listingFolder, filename);
            const relativePath = path.posix.join(directory, filename);
            fs.renameSync(file.path, finalPath);

            await Photo.create({
                listingId,
                url: relativePath,
                order: index+1,  
            });
        });

        // Dopo che tutti i file sono stati spostati → rimuovo cartella temp
        const tempFolder = path.join(process.cwd(), this.directoryPhoto, "temp");
        if (fs.existsSync(tempFolder)) {
            fs.rmSync(tempFolder, { recursive: true, force: true });
        }


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
