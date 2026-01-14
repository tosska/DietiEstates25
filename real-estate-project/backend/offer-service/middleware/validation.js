import { body, param, validationResult } from 'express-validator';

// Funzione helper per controllare se ci sono errori (da includere se non l'hai già definita)
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
        });
    }
    next();
};

// Validazione specifica per la risposta all'offerta
export const offerResponseValidation = [
    // 1. Controllo sull'ID (parametro URL): deve essere un numero > 0
    param('offerId')
        .isInt({ gt: 0 })
        .withMessage("L'ID dell'offerta non è valido (deve essere un intero positivo)"),

    // 2. Controllo sulla risposta (body): accetta SOLO 'Accepted' o 'Rejected'
    body('offerResponse')
        .trim() // Rimuove eventuali spazi vuoti accidentali
        .isIn(['Accepted', 'Rejected'])
        .withMessage('Status non valido. Deve essere "Accepted" o "Rejected"'),

    // 3. Esecuzione del controllo
    validate
];