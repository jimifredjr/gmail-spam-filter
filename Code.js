function nukeAdvancedSpoofing() {
  console.log("🚀 Script has successfully started...");

  // Search everywhere (except Trash) for emails from the last 2 days
  const threads = GmailApp.search('newer_than:2d', 0, 15);
  const myEmail = 'jimifredjr@gmail.com';
  const usernamePrefix = myEmail.split('@')[0].slice(0, 9); // "jimifredj"

  console.log(`Found ${threads.length} recent email threads to inspect.`);

  threads.forEach(thread => {
    const messages = thread.getMessages();

    for (let msg of messages) {
      try {
        const subject = msg.getSubject() || '';
        const fromHeader = msg.getFrom() || '';
        const toHeader = msg.getTo() || '';
        const ccHeader = msg.getCc() || '';
        const bccHeader = msg.getBcc() || '';

        const fromLower = fromHeader.toLowerCase();
        const toLower = toHeader.trim().toLowerCase();
        const ccLower = ccHeader.trim().toLowerCase();
        const bccLower = bccHeader.toLowerCase();

        let spamReason = null;

        // 1. Catch Invisible Unicode characters (U+3164 or ㅤ) in Subject OR Sender Name
        if (subject.includes('\u3164') || subject.includes('ㅤ') || fromHeader.includes('\u3164') || fromHeader.includes('ㅤ')) {
          spamReason = "Invisible Unicode Characters detected";
        }
        // 2. Catch URL Encoded strings in the Sender Address (e.g., %INC% or %ZRK%)
        else if (fromLower.includes("%inc") || fromLower.includes("%zrk")) {
          spamReason = "URL Encoded payload in Sender Address";
        }
        // 3. Catch the Double @ / Nested .com@ Exploit in TO, CC, or BCC
        else if (toLower.includes('.com@') || ccLower.includes('.com@') || bccLower.includes('.com@') || toLower.includes(`${myEmail}@`)) {
          spamReason = "Nested .com@ / Double @ exploit in routing headers";
        }
        // 4. Catch Bracketed Email Exploit in CC or BCC
        else if (ccLower.includes(`[${myEmail}]`) || bccLower.includes(`[${myEmail}]`)) {
          spamReason = "Bracketed Email Exploit in CC/BCC";
        }
        // 5. Catch Malformed TO Headers (The "__to" Exploit)
        else if (toLower === '__to' || (toLower.length > 0 && !toLower.includes('@'))) {
          spamReason = "Malformed TO Header (__to or missing @)";
        }
        // 6. Catch Missing TLD in routing address (e.g., <jimifredj@48318>)
        else if (/<[^@>]+@[^.>]+>/.test(toLower) || /<[^@>]+@[^.>]+>/.test(ccLower)) {
          spamReason = "Missing TLD in Routing Address";
        }
        // 7. Catch CC Subdomain Spoofing (.namprd or .prod.outlook.com)
        else if (ccLower.includes(usernamePrefix) && !ccLower.includes(myEmail) && (ccLower.includes(".namprd") || ccLower.includes(".prod.outlook.com"))) {
          spamReason = "CC Header Subdomain Spoofing";
        }
        // 8. Catch Lazy Duplicate Routing (TO and CC are exactly the same email)
        else if (toLower.includes(myEmail) && ccLower.includes(myEmail)) {
          const ccCount = (ccLower.match(/@/g) || []).length;
          const toCount = (toLower.match(/@/g) || []).length;

          if (ccCount === 1 && toCount === 1 && ccLower === toLower) {
            spamReason = "Lazy Spoofing: TO and CC are identical";
          }
        }

        // If a reason was found, nuke it
        if (spamReason) {
          console.log(`>>> SPAM CATCH - Subject: "${subject}" | Reason: ${spamReason} <<<`);

          thread.moveToSpam();
          thread.markRead();

          break; // Stop evaluating older messages in this same thread
        }
      } catch (error) {
        console.error(`Failed to process message: ${error.message}`);
      }
    }
  });

  console.log("🏁 Script finished successfully.");
}