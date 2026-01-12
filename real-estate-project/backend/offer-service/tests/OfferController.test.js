
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

   test('CE1 + CE3 + CE5: Offerta valida in Pending con risposta "Accepted"', async () => {
        // --- ARRANGE  ---   
        const validOffer = { id: 1, status: 'Pending', listing_id: 100 };
        const token = 'fake-token';
        // Simuliamo (mock) che il DB trovi l'offerta
        Offer.findByPk.mockResolvedValue(validOffer);
        // Simuliamo che l'update vada a buon fine
        Offer.update.mockResolvedValue([1]); 

        // --- ACT  ---
        const result = await OfferController.respondToOffer(1, 'Accepted', token);

        // --- ASSERT  ---
        // Verifichiamo che sia stato cercato l'ID corretto
        expect(Offer.findByPk).toHaveBeenCalledWith(1);
        
        // Verifichiamo che lo stato sia stato aggiornato nel DB (Behavior Verification)
        expect(Offer.update).toHaveBeenCalledWith(
            { status: 'Accepted' }, 
            { where: { id: 1 } }
        );

        // Teoria: Verifichiamo le interazioni con le dipendenze 
        // Poiché è 'Accepted', queste funzioni DEVONO essere chiamate
        expect(OfferService.setAllOffersRejectedForListing).toHaveBeenCalledWith(100);
        expect(ListingClient.closeListing).toHaveBeenCalledWith(100, token);
        
        expect(result).toBe(1);
    });

    test('CE1 + CE3 + CE6: Offerta valida in Pending con risposta "Rejected"', async () => {
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

    test('CE2 + CE3 + CE5: Offerta non trovata', async () => {
        // Arrange
        const token = 'fake-token';
        Offer.findByPk.mockResolvedValue(null); // CE2

        // Act & Assert
        await expect(OfferController.respondToOffer(1, 'Accepted', token))
            .rejects
            .toThrow('Offer not found');
        
        expect(Offer.update).not.toHaveBeenCalled();
    });

    test('CE1 + CE4 + CE5: Offerta già risposta', async () => {
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

    test('CE1 + CE3 + CE7: Risposta non valida', async () => {
        // Arrange
        const validOffer = { id: 1, status: 'Pending', listing_id: 100 };
        const token = 'fake-token';
        Offer.findByPk.mockResolvedValue(validOffer);

        // Act & Assert
        // Ci aspettiamo che il sistema rifiuti stringhe strane come "Forse"
        await expect(OfferController.respondToOffer(1, 'Forse', token))
            .rejects
            .toThrow(); // O specifica il messaggio se lo implementi es. "Invalid response type"
        
        // Verifica che NON venga salvato "Forse" nel DB
        expect(Offer.update).not.toHaveBeenCalled();
    });
});