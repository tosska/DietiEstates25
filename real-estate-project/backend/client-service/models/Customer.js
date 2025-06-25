
import { DataTypes } from "sequelize";
import { createHash } from "crypto";

export function createModel(database) {
  database.define('Customer', {
    CustomerID: { 
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        let hash = createHash('sha256');
        this.setDataValue('password', hash.update(value).digest('hex'));
      },
    },
    CredentialsID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
    },
  }, { 
  });
}