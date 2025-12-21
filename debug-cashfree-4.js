const { Cashfree } = require("cashfree-pg");
console.log("XClientId:", Cashfree.XClientId);
Cashfree.XClientId = "test";
console.log("XClientId after set:", Cashfree.XClientId);
