# Advanced Gmail Spam Filter

A custom Google Apps Script and local Node.js testing environment designed to intercept sophisticated spam campaigns that bypass standard Gmail filters through header manipulation and routing exploits. 

This project decouples the core regex evaluation logic from the Google Apps Script API, allowing you to unit test new spam rules locally without burning through Gmail's daily API quotas.

## 🚀 Features

Detects and flags advanced email spoofing techniques, including:
* **Nested Domain Exploits:** Catching nested `.com@` routing tricks (e.g., `user@gmail.com@spammer.net`).
* **Double `@` Routing:** Identifying malformed delivery paths.
* **Display Name Spoofing:** Detecting when the recipient's email is spoofed in the Display Name while the actual `<routing>` address points elsewhere.
* **Bracketed Email Exploits:** Flagging unnatural square bracket wrapping used to break parser logic (e.g., `[user@gmail.com]`).
* **Missing TLDs:** Catching malformed routing addresses missing a top-level domain (e.g., `<spammer@_random_nm>`).
* **Regex Safety Checks:** Prevents false positives by strictly respecting commas in multi-recipient corporate/university emails.

## 🗂️ Project Structure

* `Code.js` - The monolithic Apps Script file containing both the evaluation logic and the Gmail execution loops. This is what runs live on Google servers.
* `filter.js` - The decoupled local Node.js module containing strictly the regex evaluation logic. 
* `test.js` - The local Node.js unit testing suite utilizing mock headers.
* `.claspignore` - Ensures Node testing files and `package.json` are not pushed to Google Apps Script.

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
When a new piece of spam bypasses the filter, add its raw headers as a new test case in `test.js`, refine the regex in `filter.js`, and run the suite locally.

```bash
# Run the local unit tests
node test.js
```

## ☁️ Deployment
Push Code to Google Apps Script
Once your local tests pass, push the updated Code.js file directly to Google Apps Script using Clasp.

```Bash
clasp push
```
(After this, run your standard git commit and git push to save the version in GitHub).

