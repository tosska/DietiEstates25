import { Sequelize, DataTypes } from 'sequelize';
import { createHash } from 'crypto';

export function createModel(database) {
    database.define('Credentials', {
        id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        }, 
        providerName: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'local', // 'local', 'google', o 'facebook'
        },
        providerId: {
            type: DataTypes.STRING,
            allowNull: true, // Sarà popolato solo per i social
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
            set(value) {
            // Se value è null o stringa vuota, non eseguire l'hashing
            if (value) { 
                const hash = createHash('sha256').update(value).digest('hex');
                this.setDataValue('password', hash);
            } else {
                // Se non c'è password (Social), salviamo null o quello che viene passato
            this.setDataValue('password', null);
            }}
        },
        role: { 
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'admin',
        },
    }, { timestamps: false });
}
