const Cashfree = require("cashfree-pg");
console.log("Export keys:", Object.keys(Cashfree));
if (Cashfree.Cashfree) {
    console.log("Cashfree.Cashfree keys:", Object.keys(Cashfree.Cashfree));
}
