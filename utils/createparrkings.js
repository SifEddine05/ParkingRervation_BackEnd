const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createParking() {
  try {

    const newParkingData = {
      photo: 'parking_photo.jpg',
      nom: 'New Parking',
      addressId: 3490, 
      description: 'A new parking facility',
      nbrTotalPlaces: 50,
      nbrDisponiblePlaces: 50 
    };

    // Create new parking
    const newParking = await prisma.parking.create({
      data: newParkingData
    });

    console.log('New parking created:', newParking);
  } catch (error) {
    console.error('Error creating new parking:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createParking();
