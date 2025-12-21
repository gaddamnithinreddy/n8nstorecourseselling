require('dotenv').config();
const { Cashfree, CFEnvironment } = require("cashfree-pg");

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = CFEnvironment.SANDBOX;

const cf = new Cashfree();

const testOrder = {
    order_amount: 1.00,
    order_currency: "INR",
    order_id: "test_order_" + Date.now(),
    customer_details: {
        customer_id: "test_user_123",
        customer_phone: "9999999999",
        customer_name: "Test User",
        customer_email: "test@example.com"
    }
};

console.log("Testing Cashfree API call...");
console.log("Request:", JSON.stringify(testOrder, null, 2));

// Removed version string to match fix
cf.PGCreateOrder(testOrder)
    .then(response => {
        console.log("\n✅ SUCCESS!");
        console.log("Full Response Data:", JSON.stringify(response.data, null, 2));
    })
    .catch(error => {
        console.log("\n❌ ERROR!");
        // console.log("Error object:", error);
        console.log("Error message:", error.response?.data?.message || error.message);
        console.log("Error details:", JSON.stringify(error.response?.data, null, 2));
    });
