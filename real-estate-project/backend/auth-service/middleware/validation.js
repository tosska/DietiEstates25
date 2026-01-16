import { body, param, validationResult } from 'express-validator';

// Helper per gestire gli errori
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            message: 'Errore di validazione',
            errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
        });
    }
    next();
};

export const loginValidation = [
    body('usr').isEmail().withMessage('Email non valida'),
    body('pwd').notEmpty().withMessage('Password obbligatoria'),
    validate
];

export const registerCustomerValidation = [
    body('email').isEmail().withMessage('Email non valida'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 caratteri'),
    body('name').notEmpty().withMessage('Nome obbligatorio'),
    body('surname').notEmpty().withMessage('Cognome obbligatorio'),
    validate
];

export const registerAgentValidation = [
    body('email').isEmail().withMessage('Email non valida'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 caratteri'),
    body('name').notEmpty().withMessage('Nome obbligatorio'),
    body('surname').notEmpty().withMessage('Cognome obbligatorio'),
    body('phone').notEmpty().withMessage('Telefono obbligatorio'),
    body('vatNumber').notEmpty().withMessage('P.IVA obbligatoria'),
    validate
];

export const registerAdminValidation = [
    body('email').isEmail().withMessage('Email non valida'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 caratteri'),
    body('name').notEmpty().withMessage('Nome obbligatorio'),
    body('surname').notEmpty().withMessage('Cognome obbligatorio'),
    validate
];

export const registerAgencyValidation = [
    body('email').isEmail().withMessage('Email non valida'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 caratteri'),
    body('name').notEmpty().withMessage('Nome Manager obbligatorio'),
    body('surname').notEmpty().withMessage('Cognome Manager obbligatorio'),
    body('phone').notEmpty().withMessage('Telefono agenzia obbligatorio'),
    body('vatNumber').notEmpty().withMessage('P.IVA agenzia obbligatoria'),
    body('street').notEmpty().withMessage('Via obbligatoria'),
    body('city').notEmpty().withMessage('Città obbligatoria'),
    body('postalCode').notEmpty().withMessage('CAP obbligatorio'),
    body('state').notEmpty().withMessage('Provincia/Stato obbligatorio'),
    body('houseNumber').notEmpty().withMessage('Civico obbligatorio'),
    body('country').notEmpty().withMessage('Paese obbligatorio'),
    validate
];

// --- NUOVA VALIDAZIONE ---
export const changePasswordValidation = [
    body('password').isLength({ min: 6 }).withMessage('La nuova password deve essere di almeno 6 caratteri'),
    validate
];