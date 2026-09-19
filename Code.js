// =================================================================
// 1. THE EVALUATION LOGIC (The "Brain")
// =================================================================
function evaluateHeaders(toHeader, ccHeader, bccHeader, fromHeader, myEmail) {
  toHeader = (toHeader || '').toLowerCase();
  ccHeader = (ccHeader || '').toLowerCase();
  bccHeader = (bccHeader || '').toLowerCase();
  fromHeader = (fromHeader || '').toLowerCase();

  const allRouting = `${toHeader} ${fromHeader} ${ccHeader} ${bccHeader}`;

  // Matches <...gmail.com@gmx.net>
  const doubleAtRegex = /@gmail\.com@/;
  
  // The Liberty Univ fix: Stops at commas so it doesn't jump to other recipients
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

// =================================================================
// 2. THE GMAIL EXECUTOR (The "Hands")
// =================================================================
function nukeAdvancedSpoofing() {
  // Pulls max 15 recent, unread emails to protect your daily API quota
  const threads = GmailApp.search('in:inbox is:unread newer_than:1d', 0, 15);
  const myEmail = 'jimifredjr@gmail.com';

  threads.forEach(thread => {
    const messages = thread.getMessages();

    for (let msg of messages) {
      // Pass the headers up to the evaluation function
      const spamReason = evaluateHeaders(
        msg.getTo(), msg.getCc(), msg.getBcc(), msg.getFrom(), myEmail
      );

      // If the evaluator returns a reason, it's spam. Nuke it.
      if (spamReason) {
        console.log(`SPAM CATCH - Subject: "${msg.getSubject()}" | Reason: ${spamReason}`);
        
        thread.moveToSpam();    
        thread.markRead();
        
        break; // Stop evaluating older messages in this same thread
      }
    }
  });
}