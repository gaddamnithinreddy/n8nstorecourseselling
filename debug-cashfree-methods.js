const { Cashfree } = require("cashfree-pg");
console.log("Cashfree prototype:", Object.getOwnPropertyNames(Cashfree.prototype));
console.log("Cashfree static methods:", Object.getOwnPropertyNames(Cashfree));
try {
    const instance = new Cashfree();
    console.log("Instance properties:", Object.getOwnPropertyNames(instance));
    console.log("Instance prototype:", Object.getPrototypeOf(instance));
} catch (e) {
    console.log("Cannot instantiate Cashfree:", e.message);
}
