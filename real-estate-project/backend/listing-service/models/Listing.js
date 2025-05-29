import { DataTypes } from "sequelize";

export function createListingModel(database) {
    database.define('Listing', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(50), // Valore monetario con 2 decimali
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        listingType: {
            type: DataTypes.ENUM('Sale', 'Rent'),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('Active', 'Closed'),
            allowNull: true, // Può essere nullo se non c'è risposta
        },
        publicationDate: {
            type: DataTypes.DATE, // Eventuale controfferta monetaria
            allowNull: true,
        },
        endPublicationDate:{
            type: DataTypes.DATE,
            allowNull: false
        },
        description:{
            type: DataTypes.TEXT,
            allowNull: false
        },
        area: {
            type: DataTypes.FLOAT, 
            allowNull: false
        },
        numberRooms: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        propertyType: {
            type: DataTypes.STRING, //da capire meglio il tipo
            allowNull: false
        },
        constructionYear: {
            type: DataTypes.INTEGER, 
            allowNull: false
        },
        energyClass:{
            type: DataTypes.ENUM('A4','A3','A2','A1', 'A', 'B', 'C', 'D', 'E', 'F', 'G'),
            allowNull: true
        },
        agencyId:{
            type: DataTypes.INTEGER,
            allowNull: false,
            /*references: {
                model: 'Agencys',
                key: 'id'
            },*/
        },
        agentId:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Agents',
                key: 'id'
            },
            
        }
    }, {

    })
}

/*
nel nostro sistema, il concetto di annuncio e immobile sono strettamente correlati, se interagiscono con un annuncio voglio sicuramente le informazioni anche dell'immobile, 
quindi fare una join ogni volta.
*/