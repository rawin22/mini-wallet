# 1. Remove existing .git folder (PowerShell native way)
if (Test-Path .git) {
    Remove-Item -Recurse -Force .git
}

# 2. Initialize the NEW repository first
git init -b main

# 3. NOW set the local config (must happen after init)
git config --local credential.username rawin22

# 4. Standard Git flow
git add .
git commit -m "initial commit for react wallet"

# 5. Add remote and push
git remote add origin https://rawin22@github.com/rawin22/winpay_wallet.git
git remote set-url origin rawin22:rawin22/winpay_wallet.git
git push --set-upstream origin main
echo "Repository initialized and pushed successfully."
