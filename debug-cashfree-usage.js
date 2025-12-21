const { Cashfree, CFEnvironment } = require("cashfree-pg");

Cashfree.XClientId = "TEST_ID";
Cashfree.XClientSecret = "TEST_SECRET";
Cashfree.XEnvironment = CFEnvironment.SANDBOX;

const cf = new Cashfree();
if (cf.PGCreateOrder) {
    console.log("PGCreateOrder exists on instance.");
    // Don't actually call it as we don't have valid keys
} else {
    console.log("PGCreateOrder DOES NOT exist on instance.");
}

console.log("Static PGCreateOrder?", Cashfree.PGCreateOrder);
