const { evaluateHeaders } = require('./filter');

const myEmail = "jimifredjr@gmail.com";
let passedCount = 0;

const testCases = [
  {
    name: "Legitimate: Multiple Recipients (Liberty Univ Fix)",
    to: "jimifredjr@gmail.com, Christy Keller <ckeller2@liberty.edu>",
    cc: "", bcc: "", from: "ckeller2@liberty.edu",
    expectSpam: false
  },
  {
    name: "Legitimate: Standard Microsoft Email",
    to: "jimifredjr@gmail.com",
    cc: "", bcc: "", from: "Microsoft Family Safety <familysafety@microsoft.com>",
    expectSpam: false
  },
  {
    name: "Spam: Missing TLD / Display Name Spoof (CarShield)",
    to: "\"jimifredjr@gmail.com\" <jimifredj@_random_nm>",
    cc: "", bcc: "", from: "do-not-reply@cbdenthusiast.com",
    expectSpam: true
  },
  {
    name: "Spam: Bracketed Exploit (National Debt)",
    to: "jimifredj@154e951514r19804s9862055s4961d840t.prod.outlook.com",
    cc: "\"[jimifredjr@gmail.com]@931jwP0X.email.gmx.net <jimifredjr@gmail.com@931jwp0x.email.gmx.net>",
    bcc: "[jimifredjr@gmail.com]@aol.com", 
    from: "Community@voyagesgeth.com",
    expectSpam: true
  },
  {
    name: "Spam: Double @ Trick (Endurance)",
    to: "jimifredjr@gmail.com@fulkuudcvqjiiea.telenor.se",
    cc: "", bcc: "", from: "no-reply@kellyroyse.com",
    expectSpam: true
  }
];

console.log("=== STARTING UNIT TESTS ===\n");

testCases.forEach((test, index) => {
  const result = evaluateHeaders(test.to, test.cc, test.bcc, test.from, myEmail);
  const isSpam = result !== null;
  
  if (isSpam === test.expectSpam) {
    console.log(`✅ TEST ${index + 1} PASSED: ${test.name}`);
    if (isSpam) console.log(`   Caught by rule: ${result}`);
    passedCount++;
  } else {
    console.error(`❌ TEST ${index + 1} FAILED: ${test.name}`);
    console.error(`   Expected Spam: ${test.expectSpam} | Actual Result: ${result || "Clean"}`);
  }
});

console.log(`\n=== TESTS COMPLETE: ${passedCount}/${testCases.length} PASSED ===`);