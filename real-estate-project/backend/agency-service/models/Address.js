import { Sequelize, DataTypes } from 'sequelize';
import { createHash } from 'crypto';

export function createModel(database) {
    database.define('Address', {
        id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Street: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        City: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        Postal_Code: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        State: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        Unit_Detail: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        Longitude: {
            type: DataTypes.FLOAT(10),
            allowNull: true,
        },
        Latitude: {
            type: DataTypes.FLOAT(10),
            allowNull: true,
        },
    }, { timestamps: false });
}
