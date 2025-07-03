import { Sequelize, DataTypes } from 'sequelize';
import { createHash } from 'crypto';

export function createModel(database) {
    database.define('Admin', {
        AdminID: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
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
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value) {
            let hash = createHash('sha256');
            this.setDataValue('password', hash.update(value).digest('hex'));
            },
        },
        role: { 
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'admin',
        },
        CredentialsID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
    }, { timestamps: false });
}
