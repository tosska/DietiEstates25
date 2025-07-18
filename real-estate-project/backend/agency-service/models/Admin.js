import { Sequelize, DataTypes } from 'sequelize';
import { createHash } from 'crypto';

export function createModel(database) {
    database.define('Admin', {
        AdminID: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Manager: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        Agency_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        role: { 
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'admin',
        },
        CredentialsID: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: true,
        },
    }, { timestamps: false });
}
