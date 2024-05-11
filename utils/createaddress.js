const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function createAddresses() {
  try {
    // Read JSON files
    const wilayaData = JSON.parse(fs.readFileSync('Wilaya_Of_Algeria.json', 'utf8'));
    const communeData = JSON.parse(fs.readFileSync('Commune_Of_Algeria.json', 'utf8'));

    // Iterate over each commune
    for (const commune of communeData) {
      // Find corresponding wilaya
      const wilaya = wilayaData.find(w => w.id === commune.wilaya_id);
      if (!wilaya) {
        console.error(`Wilaya not found for commune ${commune.name}`);
        continue;
      }

      // Create Address
      const address = await prisma.address.create({
        data: {
          longitude: parseFloat(commune.longitude),
          latitude: parseFloat(commune.latitude),
          wilaya: wilaya.name,
          commune: commune.name,
          street: '', // Add street if available in your data
          parkings: { create: [] }, // Assuming parkings relation
        }
      });

      console.log(`Address created for commune ${commune.name}, wilaya ${wilaya.name}`);
    }
  } catch (error) {
    console.error('Error creating addresses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAddresses();
