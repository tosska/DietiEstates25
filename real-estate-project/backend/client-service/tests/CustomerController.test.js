// CustomerController.test.js

// Mocking del modello
jest.mock('../models/Database');

import { CustomerController } from '../controllers/CustomerController';
import { Customer } from '../models/Database';

describe('CustomerController.createCustomerT [Strategy: R-WECT Specific Combinations]', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- COMBINAZIONE 1: 1 + 4 + 6 + 8 (TUTTO VALIDO) ---
    // CE1 (CredId Valid) + CE4 (Name Valid) + CE6 (Surname Valid) + CE8 (Phone Valid & Correct)
    test('Comb. 1 [1+4+6+8]: Tutto Valido -> Crea Customer con successo', async () => {
        // Arrange
        const credentialsId = 100;       // CE1
        const name = 'Mario';            // CE4
        const surname = 'Rossi';         // CE6
        const phone = '+393331234567';   // CE8

        // Mock successo DB
        Customer.create.mockResolvedValue({
            id: 1,
            credentialsId,
            name,
            surname,
            phone,
            registrationDate: new Date()
        });

        // Act
        const result = await CustomerController.createCustomerT(credentialsId, name, surname, phone);

        // Assert
        expect(Customer.create).toHaveBeenCalledWith(expect.objectContaining({
            credentialsId,
            name,
            surname,
            phone,
            registrationDate: expect.any(Date)
        }));

        expect(result).toEqual({
            message: 'Customer created successfully',
            customerId: 1,
        });
    });

    // --- COMBINAZIONE 2: 2 + 4 + 6 + 8 (CREDENTIALS ID NULL) ---
    // CE2 (CredId Null) + CE4 + CE6 + CE8
    test('Comb. 2 [2+4+6+8]: CredentialsId Null -> Errore Campi Obbligatori', async () => {
        // Arrange
        const credentialsId = null;      // CE2
        const name = 'Mario';            // CE4
        const surname = 'Rossi';         // CE6
        const phone = '+393331234567';   // CE8

        // Act & Assert
        await expect(
            CustomerController.createCustomerT(credentialsId, name, surname, phone)
        ).rejects.toThrow('Tutti i campi obbligatori (credentialsId, name, surname) devono essere forniti');

        // Verify: Blocco preventivo, niente DB
        expect(Customer.create).not.toHaveBeenCalled();
    });

    // --- COMBINAZIONE 3: 3 + 4 + 6 + 8 (CREDENTIALS ID NON ESISTE) ---
    // CE3 (CredId Not Exist) + CE4 + CE6 + CE8
    // Nota: Poiché il controller non controlla l'esistenza prima di creare, l'errore arriva dal DB (ForeignKey)
    test('Comb. 3 [3+4+6+8]: CredentialsId non esiste nel DB -> Errore Integrità Referenziale', async () => {
        // Arrange
        const credentialsId = 999;       // CE3 (Non esiste)
        const name = 'Mario';
        const surname = 'Rossi';
        const phone = '+393331234567';

        // Simuliamo l'errore del DB (Foreign Key Constraint)
        const dbError = new Error('Foreign key constraint violation');
        Customer.create.mockRejectedValue(dbError);

        // Act & Assert
        await expect(
            CustomerController.createCustomerT(credentialsId, name, surname, phone)
        ).rejects.toThrow('Foreign key constraint violation');

        // Verify: Il metodo create VIENE chiamato, ma fallisce
        expect(Customer.create).toHaveBeenCalled();
    });

    // --- COMBINAZIONE 4: 1 + 5 + 6 + 8 (NAME NULL) ---
    // CE1 + CE5 (Name Null) + CE6 + CE8
    test('Comb. 4 [1+5+6+8]: Name Null -> Errore Campi Obbligatori', async () => {
        // Arrange
        const credentialsId = 100;
        const name = null;               // CE5
        const surname = 'Rossi';
        const phone = '+393331234567';

        // Act & Assert
        await expect(
            CustomerController.createCustomerT(credentialsId, name, surname, phone)
        ).rejects.toThrow('Tutti i campi obbligatori (credentialsId, name, surname) devono essere forniti');

        expect(Customer.create).not.toHaveBeenCalled();
    });

    // --- COMBINAZIONE 5: 1 + 4 + 7 + 8 (SURNAME NULL) ---
    // CE1 + CE4 + CE7 (Surname Null) + CE8
    test('Comb. 5 [1+4+7+8]: Surname Null -> Errore Campi Obbligatori', async () => {
        // Arrange
        const credentialsId = 100;
        const name = 'Mario';
        const surname = null;            // CE7
        const phone = '+393331234567';

        // Act & Assert
        await expect(
            CustomerController.createCustomerT(credentialsId, name, surname, phone)
        ).rejects.toThrow('Tutti i campi obbligatori (credentialsId, name, surname) devono essere forniti');

        expect(Customer.create).not.toHaveBeenCalled();
    });

    // --- COMBINAZIONE 6: 1 + 4 + 6 + 9 (PHONE SINTASSI ERRATA) ---
    // CE1 + CE4 + CE6 + CE9 (Phone Sintassi Wrong)
    test('Comb. 6 [1+4+6+9]: Phone Sintassi Errata -> Errore Validazione Regex', async () => {
        // Arrange
        const credentialsId = 100;
        const name = 'Mario';
        const surname = 'Rossi';
        const invalidPhone = 'numero-non-valido'; // CE9

        // Act & Assert
        await expect(
            CustomerController.createCustomerT(credentialsId, name, surname, invalidPhone)
        ).rejects.toThrow('Invalid phone number format');

        expect(Customer.create).not.toHaveBeenCalled();
    });

    // --- COMBINAZIONE 7: 1 + 4 + 6 + 10 (PHONE GIÀ ESISTENTE) ---
    // CE1 + CE4 + CE6 + CE10 (Phone Duplicate)
    // Nota: La sintassi è corretta, quindi passa la regex, ma il DB lo rifiuta (Unique Constraint)
    test('Comb. 7 [1+4+6+10]: Phone Già Esistente -> Errore Unique Constraint', async () => {
        // Arrange
        const credentialsId = 100;
        const name = 'Mario';
        const surname = 'Rossi';
        const duplicatePhone = '+393331234567'; // CE10 (Sintassi OK, ma esiste già)

        // Simuliamo l'errore del DB (Unique Constraint)
        const dbError = new Error('Unique constraint error: phone already exists');
        Customer.create.mockRejectedValue(dbError);

        // Act & Assert
        await expect(
            CustomerController.createCustomerT(credentialsId, name, surname, duplicatePhone)
        ).rejects.toThrow('Unique constraint error: phone already exists');

        // Verify: Il metodo create VIENE chiamato (la regex era ok), ma il DB lo blocca
        expect(Customer.create).toHaveBeenCalled();
    });

});