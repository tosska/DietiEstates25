import { body, param, validationResult } from 'express-validator';

// Middleware generico per gestire gli errori di validazione
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

// 1. Validazione generica per parametri ID (offerId, listingId, etc.)
export const validateParamId = (paramName) => [
    param(paramName)
        .isInt({ gt: 0 })
        .withMessage(`Il parametro ${paramName} deve essere un numero intero positivo`),
    validate
];

// 2. Validazione per la creazione di un'offerta
export const createOfferValidation = [
    body('listing_id')
        .isInt({ gt: 0 })
        .withMessage('Il listing_id è obbligatorio e deve essere un numero intero valido'),
    

    // Opzionale: se hai un campo note/messaggio
    body('message')
        .optional()
        .isString()
        .trim(),

    validate
];

// 3. Validazione per la risposta all'offerta
// Nota: Nel router usi req.body.response, quindi valido il campo 'response'
export const offerResponseValidation = [
    validateParamId('offerId')[0], // Riutilizziamo la regola dell'ID
    
    body('response')
        .trim()
        .isIn(['Accepted', 'Rejected'])
        .withMessage('La risposta deve essere "Accepted" o "Rejected"'),

    validate
];

// 4. Validazione per la controfferta
export const counterOfferValidation = [
    validateParamId('offerId')[0],


        
    validate
];