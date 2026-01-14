
import { DataTypes } from "sequelize";

export function createCategoryModel(database) {
    database.define('Category', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING, // Es: "school", "park", "bus" per il frontend
            allowNull: true
        }
        
    }, {timestamps: false

    })
}