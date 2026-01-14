
jest.mock('../models/Database');

// authcontroller.test.js
import { AuthController } from '../controllers/AuthController';
import { Credentials } from '../models/Database';


describe('AuthController.updateCredentialsT [Strategy: R-WECT]', () => {
    
    let mockCredentialInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup Happy Path Instance
        mockCredentialInstance = {
            update: jest.fn().mockResolvedValue(true),
            email: 'old@example.com',
            password: 'oldHashedPassword'
        };
    });

    // --- 1: CE1 + CE3 + CE6 (TUTTO VALIDO - HAPPY PATH) ---
    // ID Valido + Password Valida + Email Valida
    test('Caso 1: Tutto Valido -> Deve aggiornare con successo', async () => {
        // Arrange
        Credentials.findByPk.mockResolvedValue(mockCredentialInstance); // CE1
        const validEmail = 'valid@test.com'; // CE6
        const validPass = 'ValidPass123';  // CE3

        // Act
        const result = await AuthController.updateCredentialsT(1, validEmail, validPass);

        // Assert
        expect(mockCredentialInstance.update).toHaveBeenCalledWith({
            email: validEmail,
            password: validPass
        });

        expect(result).toEqual({ message: 'Credenziali aggiornate con successo' });
    });

    // --- 2: CE2 + CE3 + CE6 (ID INVALIDO) ---
    // ID Inesistente + Password Valida + Email Valida
    test('Caso 2: ID Invalido (+ altri validi) -> Errore "Credentials not found"', async () => {
        // Arrange
        Credentials.findByPk.mockResolvedValue(null); // CE2 (ID non trovato)
        const validEmail = 'valid@test.com'; // CE6
        const validPass = 'ValidPass123';  // CE3

        // Act & Assert
        await expect(
            AuthController.updateCredentialsT(999, validEmail, validPass)
        ).rejects.toThrow('Credentials not found');

        expect(Credentials.findByPk).toHaveBeenCalledWith(999);
    });

    // --- 3: CE1 + CE4 + CE6 (PASSWORD SINTASSI INVALIDA) ---
    // ID Valido + Password Debole + Email Valida
    test('Caso 3: Password Sintassi Errata (+ altri validi) -> Errore "Password debole"', async () => {
        // Arrange
        Credentials.findByPk.mockResolvedValue(mockCredentialInstance); // CE1
        const validEmail = 'valid@test.com'; // CE6
        const invalidSyntaxPass = 'short';   // CE4

        // Act & Assert
        await expect(
            AuthController.updateCredentialsT(1, validEmail, invalidSyntaxPass)
        ).rejects.toThrow('Password debole: deve contenere almeno 8 caratteri, una lettera e un numero');

        expect(Credentials.findByPk).not.toHaveBeenCalled();
    });

    // --- 4: CE1 + CE5 + CE6 (PASSWORD MANCANTE) ---
    // ID Valido + Password Null/Missing + Email Valida
    test('Caso 4: Password Mancante (+ altri validi) -> Errore "Email and/or Password missing"', async () => {
        // Arrange
        Credentials.findByPk.mockResolvedValue(mockCredentialInstance); // CE1
        const validEmail = 'valid@test.com'; // CE6
        const missingPass = null;            // CE5

        // Act & Assert
        await expect(
            AuthController.updateCredentialsT(1, validEmail, missingPass)
        ).rejects.toThrow('Email and/or Password missing');

        expect(Credentials.findByPk).not.toHaveBeenCalled();
    });

    // --- 5: CE1 + CE3 + CE7 (EMAIL SINTASSI INVALIDA) ---
    // ID Valido + Password Valida + Email Sintassi Errata
    test('Caso 5: Email Sintassi Errata (+ altri validi) -> Errore "Formato email non valido"', async () => {
        // Arrange
        Credentials.findByPk.mockResolvedValue(mockCredentialInstance); // CE1
        const invalidSyntaxEmail = 'no-at-sign.com'; // CE7
        const validPass = 'ValidPass123';            // CE3

        // Act & Assert
        await expect(
            AuthController.updateCredentialsT(1, invalidSyntaxEmail, validPass)
        ).rejects.toThrow('Formato email non valido');

        expect(Credentials.findByPk).not.toHaveBeenCalled();
    });

    // --- 6: CE1 + CE3 + CE8 (EMAIL MANCANTE) ---
    // ID Valido + Password Valida + Email Null/Missing
    test('Caso 6: Email Mancante (+ altri validi) -> Errore "Email and/or Password missing"', async () => {
        // Arrange
        Credentials.findByPk.mockResolvedValue(mockCredentialInstance); // CE1
        const missingEmail = null;           // CE8
        const validPass = 'ValidPass123';    // CE3

        // Act & Assert
        await expect(
            AuthController.updateCredentialsT(1, missingEmail, validPass)
        ).rejects.toThrow('Email and/or Password missing');

        expect(Credentials.findByPk).not.toHaveBeenCalled();
    });

});