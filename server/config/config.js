// =======================
//  Puerto
// =======================
process.env.PORT = process.env.PORT || 3001;

// =======================
//  Entorno
// =======================
process.env.NODE_ENV = process.env.NODE_ENV || "dev";

// =======================
//  Fecha de vencimiento
// =======================
process.env.CADUCIDAD_TOKEN = Math.floor(Date.now() / 1000) + 60 * 60;

// =======================
//  Seed
// =======================
process.env.SEED = process.env.SEED || "QUITO-PICHINCHA-UTOPIA ";


// =======================
//  Base de datos
// =======================
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/utopia";


// =======================
//  URL Base
// =======================
process.env.URLBASE = process.env.URLBASE || "http://localhost:4200/";
