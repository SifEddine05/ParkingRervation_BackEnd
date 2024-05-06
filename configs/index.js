const PORT = Number(process.env.PORT) || 8000;
const JWT_SECRET = process.env.JWT_SECRET || "DUMMY_KEY";
const JWT_EXP = Number(process.env.JWT_EXP) || 2592000;


module.exports = {
    PORT,
    JWT_SECRET,
    JWT_EXP
}