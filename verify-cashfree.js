require('dotenv').config();

console.log("=== Environment Variables ===");
console.log("CASHFREE_APP_ID:", process.env.CASHFREE_APP_ID || "NOT SET");
console.log("CASHFREE_SECRET_KEY:", process.env.CASHFREE_SECRET_KEY ? "SET (hidden)" : "NOT SET");
console.log("CASHFREE_ENV:", process.env.CASHFREE_ENV || "NOT SET");

console.log("\n=== Testing Cashfree SDK ===");
const { Cashfree, CFEnvironment } = require("cashfree-pg");

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = process.env.CASHFREE_ENV === "PROD"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;

console.log("Cashfree.XClientId:", Cashfree.XClientId || "NOT SET");
console.log("Cashfree.XClientSecret:", Cashfree.XClientSecret ? "SET" : "NOT SET");
console.log("Cashfree.XEnvironment:", Cashfree.XEnvironment);

const cf = new Cashfree();
console.log("\nCashfree instance created successfully");
console.log("Has PGCreateOrder method:", typeof cf.PGCreateOrder === 'function');
