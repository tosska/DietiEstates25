import { Sequelize, DataTypes } from 'sequelize';
import { createHash } from 'crypto';

export function createModel(database) {
    database.define('Credentials', {
        ID: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
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
    }, { timestamps: false });
}
