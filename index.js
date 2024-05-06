const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
// const prisma = require("./models/prisma.client");
const {PORT } = require("./configs/index");
const authRouter = require("./routes/auth.route");




app.use(cors());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);


app.use("/api/auth", authRouter);



if (process.env.NODE_ENV !== "test") {
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening at http://localhost:${PORT}`);
    });
  }


  /*User(fullName , email ,password , Phone , Address)
Address(longitude,lattude,wilaya,commune)
Parking(photo,nom,Address,Commune,Wilaya,longitude,latitude , Description)

*/