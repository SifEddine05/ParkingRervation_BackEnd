const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Fetch existing addresses
  const addresses = await prisma.address.findMany();
  
  if (addresses.length < 15) {
    throw new Error('Not enough addresses available. Please ensure there are at least 15 addresses in the database.');
  }

  // Create 15 parking records
  const parkings = [];
  for (let i = 0; i < 15; i++) {
    const address = addresses[i];
    parkings.push({
      photo: `https://example.com/photo${i + 1}.jpg`,
      nom: `Parking ${i + 1}`,
      addressId: address.id,
      description: `Description for Parking ${i + 1}`,
      nbrTotalPlaces: Math.floor(Math.random() * 100 + 1), // Random number of places between 1 and 100
      pricePerHour: parseFloat((Math.random() * 10 + 1).toFixed(2)), // Random price per hour between 1 and 10
    });
  }

  // Insert parkings into the database
  const createdParkings = await prisma.parking.createMany({
    data: parkings,
    skipDuplicates: true, // Skip duplicate entries if any
  });

  console.log('Parkings created:', createdParkings);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
