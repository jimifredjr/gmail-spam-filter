function evaluateHeaders(toHeader, ccHeader, bccHeader, fromHeader, myEmail) {
    toHeader = (toHeader || '').toLowerCase();
    ccHeader = (ccHeader || '').toLowerCase();
    bccHeader = (bccHeader || '').toLowerCase();
    fromHeader = (fromHeader || '').toLowerCase();
  
    const allRouting = `${toHeader} ${fromHeader} ${ccHeader} ${bccHeader}`;
  
    const doubleAtRegex = /@gmail\.com@/;
    const spoofedDisplayRegex = /jimifredj[r]?@gmail\.com[^,]*?<([^>]+)>/;
  
    if (doubleAtRegex.test(toHeader)) return "Double @ in TO";
    const toMatch = toHeader.match(spoofedDisplayRegex);
    if (toMatch && toMatch[1] !== myEmail) return "Spoofed Display Name in TO";
  
    if (doubleAtRegex.test(ccHeader)) return "Double @ in CC";
    const ccMatch = ccHeader.match(spoofedDisplayRegex);
    if (ccMatch && ccMatch[1] !== myEmail) return "Spoofed Display Name in CC";
  
    if (allRouting.includes(".com@")) return "Nested .com@ exploit";
  
    if (allRouting.includes("[jimifredjr@gmail.com]") || allRouting.includes("[jimifredj@gmail.com]")) {
      return "Bracketed Email Exploit";
    }
  
    const invalidTld = /<[^@>]+@[^.>]+>/;
    if (invalidTld.test(allRouting)) return "Missing TLD in Routing Address";
  
    return null; 
  }
  
  // Export the function so the test file can use it
  module.exports = { evaluateHeaders };