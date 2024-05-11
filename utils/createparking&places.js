const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createParkingAndPlaces() {
    try {
        // Iterate to create 5 parkings
        for (let i = 1; i <= 5; i++) {
            // Create parking
            const newParkingData = {
                photo: `parking_photo_${i}.jpg`,
                nom: `Parking ${i}`,
                addressId: 3490, // Change this to the actual addressId
                description: `A new parking facility ${i}`,
                nbrTotalPlaces: 20, // Total places for the parking (2 floors * 10 places per floor)
                nbrDisponiblePlaces: 20 // Initially all places are available
            };
            const newParking = await prisma.parking.create({
                data: newParkingData
            });

            console.log(`New parking created: ${newParking.nom}`);

            // Create places for each floor
            for (let floor = 1; floor <= 2; floor++) {
                for (let placeNumber = 1; placeNumber <= 10; placeNumber++) {
                    await prisma.place.create({
                        data: {
                            parkingId: newParking.id,
                            floor: floor,
                            isCovered: true, // Assuming all places are covered
                            pricePerHour: 10.00, // Change this to the actual price per hour
                            isReserved: false // Initially all places are not reserved
                        }
                    });
                }
                console.log(`Places created for floor ${floor} of parking ${newParking.nom}`);
            }
        }
    } catch (error) {
        console.error('Error creating parkings and places:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createParkingAndPlaces();
