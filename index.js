const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const path = require("path"); // Import the path module

// const prisma = require("./models/prisma.client");
const {PORT } = require("./configs/index");
const authRouter = require("./routes/auth.route");
const parkingRouter = require("./routes/parking.route");
const reservationRouter = require("./routes/reservation.route");




app.use(cors());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use('/uploads/qrcodes', express.static(path.join(__dirname, 'uploads/qrcodes')));


app.use("/api/auth", authRouter);
app.use("/api/parkings/",parkingRouter)
app.use("/api/reservation/",reservationRouter)


if (process.env.NODE_ENV !== "test") {
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening at http://localhost:${PORT}`);
    });
  }


/*
User(fullName , email ,password , Phone , Address)
Address(longitude,lattude,wilaya,commune)
Parking(photo,nom,Address_id , Description,PriceParHour,Nbr_total_Place,Nbr_Disponible_Places)
Reservation(reservationRandomId , dateAndTimeReservation,nbrHours,totalPrice,UserId,ParkingId,Date_debut,Time_debut,Position,QRcode,status,Place) the possible status to (active,finished,expired,cancled)
Notification(seen,DateandTimeNotification,Title,desciprion)
*/


// Get All Parkings , get most visited parkings , get parking by id , get nearest parkings ,
//get Disponible Places ,get All Reservation , get Active Reservation , get failed reservation ,get reservation by id 
//get Notification filtred by Day , create Notification when verify qrcode 
// create notification to notify user 1 hour before the reservation 
//create reservation , 
