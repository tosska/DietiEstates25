import { Sequelize, DataTypes } from 'sequelize';
import { createHash } from 'crypto';

export function createModel(database) {
    database.define('Agency', {
        AgencyID: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Phone: {
            type: DataTypes.STRING(105),
            allowNull: false,
        },
        Description: {
            type: DataTypes.TEXT('clob'),
            allowNull: false,
        },
        VAT_Number: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        Website: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        ManagerAdmin_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Address_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, { timestamps: false });
}
