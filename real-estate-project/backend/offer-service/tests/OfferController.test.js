
// Teoria: Usiamo i Mock per isolare l'unità di codice
jest.mock('../models/Database');
jest.mock('../services/OfferService');
jest.mock('../clients/ListingClient');



// Assumiamo che la tua funzione sia in un file chiamato 'OfferController.js'
import { OfferController } from '../controllers/OfferController'; // Aggiusta il percorso se serve
import { Offer } from '../models/Database';
import { OfferService } from '../services/OfferService';
import { ListingClient } from '../clients/ListingClient';


describe('respondToOffer', () => {

    // Reset dei mock prima di ogni test per garantire indipendenza (Teoria: "It is consistent, repeatable" [cite: 43])
    beforeEach(() => {
        jest.clearAllMocks();
    });

   test('Caso 1: CE1 + CE3 + CE5: Offerta valida in Pending con risposta "Accepted"', async () => {
        // --- ARRANGE  ---   
        const validOffer = { id: 1, status: 'Pending', listing_id: 100 };
        const token = 'fake-token';
      
        Offer.findByPk.mockResolvedValue(validOffer);
        Offer.update.mockResolvedValue([1]); 

        // --- ACT  ---
        const result = await OfferController.respondToOffer(1, 'Accepted', token);

        // --- ASSERT  ---
 
        expect(Offer.findByPk).toHaveBeenCalledWith(1);
        
        expect(Offer.update).toHaveBeenCalledWith(
            { status: 'Accepted' }, 
            { where: { id: 1 } }
        );

        // Poiché è 'Accepted', queste funzioni DEVONO essere chiamate
        expect(OfferService.setAllOffersRejectedForListing).toHaveBeenCalledWith(100);
        expect(ListingClient.closeListing).toHaveBeenCalledWith(100, token);
        
        expect(result).toBe(1);
    });

    test('Caso 2: CE1 + CE3 + CE6: Offerta valida in Pending con risposta "Rejected"', async () => {
        // Arrange
        const validOffer = { id: 1, status: 'Pending', listing_id: 100 };
        const token = 'fake-token';
        Offer.findByPk.mockResolvedValue(validOffer);
        Offer.update.mockResolvedValue([1]);

        // Act
        const result = await OfferController.respondToOffer(1, 'Rejected', token);

        // Assert
        expect(Offer.update).toHaveBeenCalledWith({ status: 'Rejected' }, { where: { id: 1 } });
        // Verifica che NON ci siano side-effects
        expect(OfferService.setAllOffersRejectedForListing).not.toHaveBeenCalled();
        expect(ListingClient.closeListing).not.toHaveBeenCalled();
        expect(result).toBe(1);
    });

    test('Caso 3: CE2 + CE3 + CE5: Offerta non trovata', async () => {
        // Arrange
        const token = 'fake-token';
        Offer.findByPk.mockResolvedValue(null); // CE2

        // Act & Assert
        await expect(OfferController.respondToOffer(1, 'Accepted', token))
            .rejects
            .toThrow('Offer not found');
        
        expect(Offer.update).not.toHaveBeenCalled();
    });

    test('Caso 4: CE1 + CE4 + CE5: Offerta già risposta', async () => {
        // Arrange
        const token = 'fake-token';
        const offerNotPending = { id: 1, status: 'Accepted', listing_id: 100 }; // CE4
        Offer.findByPk.mockResolvedValue(offerNotPending);

        // Act & Assert
        await expect(OfferController.respondToOffer(1, 'Rejected', token))
            .rejects
            .toThrow('This offer has already been responded to');
        
        expect(Offer.update).not.toHaveBeenCalled();
    });

    test('Caso 5: CE1 + CE3 + CE7: Risposta non valida', async () => {
        // Arrange
        const validOffer = { id: 1, status: 'Pending', listing_id: 100 };
        const token = 'fake-token';
        Offer.findByPk.mockResolvedValue(validOffer);

        // Act & Assert
        await expect(OfferController.respondToOffer(1, 'Forse', token))
            .rejects
            .toThrow(); 
        
        expect(Offer.update).not.toHaveBeenCalled();
    });
});