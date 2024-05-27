
const Webcam = require('node-webcam');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const jsQR = require('jsqr');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create webcam instance
const webcam = Webcam.create({
    width: 640,
    height: 480,
    output: 'jpeg',
    quality: 100,
  });
  
  // Function to capture image from webcam
  function captureImage() {
    return new Promise((resolve, reject) => {
      webcam.capture('capture', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }


// Function to read image data from a local file
async function readImageData(filePath) {
  const image = await loadImage(filePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, image.width, image.height);
}

// Function to decode QR code from image data
function decodeQRCode(imageData) {
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'dontInvert',
  });
  return code ? code.data : null;
}

// Main function to decode QR code from a local file
async function main() {

  

  try {
    const qrCodeFilePath = await captureImage();
    // Read image data from local file
    const imageData = await readImageData(qrCodeFilePath);

    // Decode QR code
    const qrCodeContent = decodeQRCode(imageData);



    if (qrCodeContent) {
      console.log('QR Code content:', qrCodeContent);
      const reservationRandomId = qrCodeContent
      const finishedReservation = await prisma.reservation.updateMany({
        where: {
            reservationRandomId: reservationRandomId,
        },
        data: {
            status: "finished",
        },
    })
    console.log('reservation : ',finishedReservation);
    } else {
      console.log('No QR Code found in the image.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Start decoding QR code from a local file
main();
