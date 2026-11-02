const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, 'Code.js'), 'utf8');

const testCases = [
  {
    name: "Legitimate: Multiple recipients",
    to: "jimifredjr@gmail.com, Christy Keller <ckeller2@liberty.edu>",
    cc: "", bcc: "", from: "ckeller2@liberty.edu",
    expectSpam: false
  },
  {
    name: "Legitimate: Standard Microsoft email",
    to: "jimifredjr@gmail.com",
    cc: "", bcc: "", from: "Microsoft Family Safety <familysafety@microsoft.com>",
    expectSpam: false
  },
  {
    name: "Spam: Missing TLD",
    to: "\"jimifredjr@gmail.com\" <jimifredj@_random_nm>",
    cc: "", bcc: "", from: "do-not-reply@cbdenthusiast.com",
    expectSpam: true
  },
  {
    name: "Spam: Bracketed address",
    to: "jimifredj@154e951514r19804s9862055s4961d840t.prod.outlook.com",
    cc: "\"[jimifredjr@gmail.com]@931jwP0X.email.gmx.net <jimifredjr@gmail.com@931jwp0x.email.gmx.net>",
    bcc: "[jimifredjr@gmail.com]@aol.com",
    from: "Community@voyagesgeth.com",
    expectSpam: true
  },
  {
    name: "Spam: Double @ routing",
    to: "jimifredjr@gmail.com@fulkuudcvqjiiea.telenor.se",
    cc: "", bcc: "", from: "no-reply@kellyroyse.com",
    expectSpam: true
  },
  {
    name: "Spam: Invisible Unicode in subject",
    subject: "Important ㅤ notice",
    to: "jimifredjr@gmail.com",
    cc: "", bcc: "", from: "sender@example.com",
    expectSpam: true
  },
  {
    name: "Spam: Encoded sender address",
    to: "jimifredjr@gmail.com",
    cc: "", bcc: "", from: "sender%INC@example.com",
    expectSpam: true
  },
  {
    name: "Spam: Spoofed CC subdomain",
    to: "jimifredjr@gmail.com",
    cc: "jimifredj@tenant.namprd.example.com",
    bcc: "", from: "sender@example.com",
    expectSpam: true
  },
  {
    name: "Spam: Identical TO and CC",
    to: "jimifredjr@gmail.com",
    cc: "jimifredjr@gmail.com",
    bcc: "", from: "sender@example.com",
    expectSpam: true
  }
];

function isThreadMovedToSpam(test) {
  let movedToSpam = false;
  const message = {
    getSubject: () => test.subject || '',
    getFrom: () => test.from,
    getTo: () => test.to,
    getCc: () => test.cc,
    getBcc: () => test.bcc
  };
  const thread = {
    getMessages: () => [message],
    moveToSpam: () => { movedToSpam = true; },
    markRead: () => {}
  };
  const context = {
    GmailApp: { search: () => [thread] },
    console: { log: () => {}, error: (...args) => console.error(...args) }
  };

  vm.createContext(context);
  vm.runInContext(script, context, { filename: 'Code.js' });
  context.nukeAdvancedSpoofing();
  return movedToSpam;
}

console.log('=== STARTING UNIT TESTS ===\n');

let passedCount = 0;
testCases.forEach((test, index) => {
  const isSpam = isThreadMovedToSpam(test);

  if (isSpam === test.expectSpam) {
    console.log(`TEST ${index + 1} PASSED: ${test.name}`);
    passedCount++;
  } else {
    console.error(`TEST ${index + 1} FAILED: ${test.name}`);
    console.error(`   Expected Spam: ${test.expectSpam} | Actual Spam: ${isSpam}`);
  }
});

console.log(`\n=== TESTS COMPLETE: ${passedCount}/${testCases.length} PASSED ===`);
if (passedCount !== testCases.length) {
  process.exitCode = 1;
}