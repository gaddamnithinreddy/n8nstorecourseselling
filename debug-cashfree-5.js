const { Cashfree } = require("cashfree-pg");
console.log("XEnvironment:", Cashfree.XEnvironment);
Cashfree.XEnvironment = 1; // Try setting it
console.log("XEnvironment after set:", Cashfree.XEnvironment);
