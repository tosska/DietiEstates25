import { Sequelize, DataTypes } from 'sequelize';
import { createHash } from 'crypto';
import { url } from 'inspector';

export function createModel(database) {
    database.define('Agent', {
        id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true,    // per test
        },
        surname: {
            type: DataTypes.STRING(255),
            allowNull: true,    // per test
        },
        phone: {
            type: DataTypes.STRING(255),
            allowNull: true,    // per test
        },
        vatNumber: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        yearsExperience: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        urlPhoto: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        agencyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        creatorAdminId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        credentialsId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
    
    }, { timestamps: false });
}
