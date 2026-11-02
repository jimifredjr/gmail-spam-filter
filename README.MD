# Advanced Gmail Spam Filter

A Google Apps Script that scans recent Gmail threads for suspicious sender and routing patterns, with a local Node.js test suite.

The filter processes up to 15 matching threads per run. Flagged threads are moved to Spam and marked as read.

## 🚀 Features

The current rules flag:
* Invisible Unicode characters in the subject or sender header.
* `%INC` or `%ZRK` markers in the sender header.
* Nested `.com@` routing in To, Cc, or Bcc, and the account address followed by another `@` in To.
* Bracketed account addresses in Cc or Bcc.
* Malformed To headers without an `@`.
* Routing addresses missing a top-level domain in To or Cc.
* Cc addresses containing the account username prefix and a `.namprd` or `.prod.outlook.com` subdomain, unless the account address itself is also present.
* Identical To and Cc headers containing only one `@` each.

## 🗂️ Project Structure

* `Code.js` - The Apps Script filter rules and Gmail execution function deployed to Google.
* `test.js` - A Node.js test suite that runs `Code.js` with mocked Gmail threads.
* `.claspignore` - Excludes local Node.js testing files and package metadata from Apps Script deployments.

## 📋 Prerequisites

- [ ] Node.js installed locally
- [ ] [Google Apps Script API enabled](https://script.google.com/home/usersettings) on your Google account
- [ ] Google Clasp CLI installed globally (`npm install -g @google/clasp`)

## Setup

### Clone the Live Script:
Find your Script ID in your Google Apps Script URL (script.google.com/u/0/home/projects/YOUR_SCRIPT_ID/edit).

```Bash
clasp clone YOUR_SCRIPT_ID
```

### Set Up the Automation Trigger in Google
To make the script run automatically in the background of your Gmail account:

Go to script.google.com and open your spam filter project.

In the left-hand menu, click on the Triggers icon (the alarm clock).

Click + Add Trigger in the bottom right corner.

Configure with these exact settings:

Choose which function to run: nukeAdvancedSpoofing

Choose which deployment should run: Head

Select event source: Time-driven

Select type of time based trigger: Minutes timer

Select minute interval: Every 15 minutes (or 30 minutes to protect API quotas)

Click Save.

### Grant Permissions
When you save the trigger, Google will ask you to authorize the script. Click Advanced -> Go to [Project Name] (unsafe) -> Allow.

### Verify Protection:
Make sure the .claspignore file is present in your directory. This prevents clasp from trying to upload your Node testing files to Google's servers.

## 💻 Local Development & Testing
When a new piece of spam bypasses the filter, add a test case to `test.js` and update the corresponding rule in `Code.js`. The tests use a mocked Gmail API and do not access your Gmail account.

```bash
npm test
```

## ☁️ Deployment
Push Code to Google Apps Script
Once your local tests pass, push the updated Apps Script source to Google Apps Script using Clasp.

```Bash
clasp push
```
(After this, run your standard git commit and git push to save the version in GitHub).
