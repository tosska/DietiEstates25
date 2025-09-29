
import { DataTypes } from "sequelize";
import { createHash } from "crypto";

export function createModel(database) {
  database.define('Customer', {
    id: { 
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Surname: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Registration_Date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    Phone: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    CredentialsID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
    },
  }, { 
  });
}