import { describe, test, expect } from '@jest/globals';
// Assumo che la tua classe si chiami GeoUtils e sia importata correttamente
import { Utils } from '../src/models/Utils'; 

describe('GeoUtils.haversine [TypeScript Unit Tests]', () => {

    //CASO MINIMO
    test('Caso 1: Stesse coordinate -> Distanza deve essere 0', () => {
        const lat = 45.4642;
        const lon = 9.1900;
        
        // Input: stessi valori per punto A e B
        const result: number = Utils.haversine(lat, lon, lat, lon);
        
        expect(result).toBe(0);
    });

    //CASO SUCCESSIVO AL MINIMO
    // Verifica la formula base: 1° lat (circa 111.195 km)
    test('Caso 2: Delta di 1 grado latitudine -> ~111.195 km', () => {
        const result: number = Utils.haversine(0, 0, 1, 0);
        
        // Uso toBeCloseTo per gestire i floating point
        expect(result).toBeCloseTo(111.195, 2); 
    });

    // CASO NOMINALE: 
    // Milano (45.4642, 9.1900) -> Roma (41.9028, 12.4964)
    // Distanza attesa: circa 477 km
    test('Caso 3: Milano -> Roma -> ~477 km', () => {
        const miLat = 45.4642, miLon = 9.1900;
        const rmLat = 41.9028, rmLon = 12.4964;

        const result: number = Utils.haversine(miLat, miLon, rmLat, rmLon);
        
        expect(result).toBeCloseTo(477, 0);
    });


    // SALTO DELL'ANTIMERIDIANO gestire il salto tra 179° e -179°
    // La distanza dovrebbe essere piccola (2° di long), NON immensa (358°)
    test('Caso 4: Crossing Date Line (179°E -> 179°W) -> Distanza breve', () => {
        // All'equatore, 2 gradi di differenza
        // 179 (Est) a -179 (Ovest) sono vicini nel Pacifico
        const result: number = Utils.haversine(0, 179, 0, -179);
        
        // 2 gradi * 111.195 ≈ 222.4 km
        expect(result).toBeCloseTo(222.4, 1);
    });

    // LIMITE GEOMETRICO: dal Polo Nord all'Equatore
    // Verifica che la matematica regga ai poli (cos(90) = 0)
    test('Caso 5: Polo Nord -> Equatore -> ~10,007 km', () => {
        const result: number = Utils.haversine(90, 0, 0, 0);
        
        // Un quarto della circonferenza terrestre
        expect(result).toBeCloseTo(10007.5, 1);
    });



});