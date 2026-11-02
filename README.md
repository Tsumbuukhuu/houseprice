# Баянгол үнийн шалгалт

Static site on GitHub Pages. The master listing data is encrypted (AES-GCM) with the site password; the page decrypts it in the browser.
Nicknames and each person's own list are saved in that browser only.

## Update the master list
1. Edit `master.json` (local only, git-ignored): `listings[]` feeds the price stats, `items[]` is the browsable list. Bump `asOf`.
2. Run `./publish.sh`, enter the password, done. Use the same password to keep it, or a new one to change it.
