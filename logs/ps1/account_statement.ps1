# Account Statement API Test Script
# Fetches account statements for a specific currency with flexible date range

# 1. Configuration
$BaseUrl  = "https://www.bizcurrency.com:20200/api/v1"
$CallerId = "819640E9-8DF1-4DB9-B13B-E9DCDDEEBA58"

# 2. User Credentials
$Username = "ralf"
$Password = "1oxPublic26"

# 3. Authenticate
$AuthBody = @{
    loginId                             = $Username
    password                            = $Password
    callerId                            = $CallerId
    includeUserSettingsInResponse       = $true
    includeAccessRightsWithUserSettings = $false
} | ConvertTo-Json

Write-Host "`n=== AUTHENTICATING ===" -ForegroundColor Cyan
try {
    $AuthResponse = Invoke-RestMethod -Uri "$BaseUrl/authenticate" `
                                      -Method Post `
                                      -Body $AuthBody `
                                      -ContentType "application/json"

    $Token      = $AuthResponse.tokens.accessToken
    $CustomerId = $AuthResponse.userSettings.organizationId

    if (-not $Token) { throw "Authentication failed." }
    Write-Host "✓ Login Successful" -ForegroundColor Green
    Write-Host "  Customer ID: $CustomerId`n" -ForegroundColor Gray
}
catch {
    Write-Error "Authentication Error: $_"
    exit
}

# 4. Get All Balances
$Headers = @{ "Authorization" = "Bearer $Token" }

Write-Host "=== FETCHING AVAILABLE ACCOUNTS ===" -ForegroundColor Cyan
try {
    $BalanceUrl = "$BaseUrl/CustomerAccountBalance/$CustomerId"
    $BalanceData = Invoke-RestMethod -Uri $BalanceUrl -Method Get -Headers $Headers

    if (-not $BalanceData.balances) {
        Write-Error "No balances found."
        exit
    }

    # Display available accounts
    Write-Host "`nAvailable Accounts:" -ForegroundColor Yellow
    $Index = 0
    $Accounts = @()
    
    foreach ($balance in $BalanceData.balances) {
        $Index++
        $Accounts += [PSCustomObject]@{
            Number      = $Index
            Currency    = $balance.currencyCode
            AccountId   = $balance.accountId
            AccountNum  = $balance.accountNumber
            Balance     = $balance.balanceAvailable
        }
        
        Write-Host ("  {0}. {1,-8} (Account: {2}) - Balance: {3:N2}" -f `
            $Index, 
            $balance.currencyCode, 
            $balance.accountNumber, 
            $balance.balanceAvailable) -ForegroundColor White
    }
}
catch {
    Write-Error "Failed to retrieve balances: $_"
    exit
}

# 5. Prompt User to Select Currency
Write-Host "`n=== SELECT ACCOUNT ===" -ForegroundColor Cyan
$Selection = Read-Host "Enter account number (1-$($Accounts.Count))"

try {
    $SelectedIndex = [int]$Selection - 1
    if ($SelectedIndex -lt 0 -or $SelectedIndex -ge $Accounts.Count) {
        throw "Invalid selection."
    }
    
    $SelectedAccount = $Accounts[$SelectedIndex]
    Write-Host "✓ Selected: $($SelectedAccount.Currency) (Account ID: $($SelectedAccount.AccountId))" -ForegroundColor Green
}
catch {
    Write-Error "Invalid selection: $_"
    exit
}

# 6. Prompt for Date Range
Write-Host "`n=== SELECT DATE RANGE ===" -ForegroundColor Cyan
Write-Host "Options:" -ForegroundColor Yellow
Write-Host "  1. Last 7 days"
Write-Host "  2. Last 30 days"
Write-Host "  3. Last 90 days"
Write-Host "  4. Custom date range"

$DateOption = Read-Host "Select option (1-4)"

$EndDate = Get-Date
$StartDate = $EndDate

switch ($DateOption) {
    "1" { 
        $StartDate = $EndDate.AddDays(-7)
        Write-Host "✓ Date Range: Last 7 days" -ForegroundColor Green
    }
    "2" { 
        $StartDate = $EndDate.AddDays(-30)
        Write-Host "✓ Date Range: Last 30 days" -ForegroundColor Green
    }
    "3" { 
        $StartDate = $EndDate.AddDays(-90)
        Write-Host "✓ Date Range: Last 90 days" -ForegroundColor Green
    }
    "4" {
        Write-Host "`nEnter custom date range:" -ForegroundColor Yellow
        $StartDateInput = Read-Host "  Start Date (yyyy-MM-dd)"
        $EndDateInput = Read-Host "  End Date (yyyy-MM-dd)"
        
        try {
            $StartDate = [DateTime]::ParseExact($StartDateInput, "yyyy-MM-dd", $null)
            $EndDate = [DateTime]::ParseExact($EndDateInput, "yyyy-MM-dd", $null)
            
            if ($StartDate -gt $EndDate) {
                throw "Start date cannot be after end date."
            }
            
            Write-Host "✓ Custom Date Range: $($StartDate.ToString('yyyy-MM-dd')) to $($EndDate.ToString('yyyy-MM-dd'))" -ForegroundColor Green
        }
        catch {
            Write-Error "Invalid date format or range: $_"
            exit
        }
    }
    default {
        Write-Error "Invalid option selected."
        exit
    }
}

# 7. Fetch Account Statement
Write-Host "`n=== FETCHING ACCOUNT STATEMENT ===" -ForegroundColor Cyan
Write-Host "  Currency: $($SelectedAccount.Currency)" -ForegroundColor Gray
Write-Host "  Period: $($StartDate.ToString('yyyy-MM-dd')) to $($EndDate.ToString('yyyy-MM-dd'))`n" -ForegroundColor Gray

try {
    # Format dates for API (yyyy-MM-dd)
    $StrStartDate = $StartDate.ToString("yyyy-MM-dd")
    $StrEndDate = $EndDate.ToString("yyyy-MM-dd")
    
    # Build API URL with query parameters
    $StatementUrl = "$BaseUrl/CustomerAccountStatement?accountId=$($SelectedAccount.AccountId)&strStartDate=$StrStartDate&strEndDate=$StrEndDate"
    
    $StatementData = Invoke-RestMethod -Uri $StatementUrl -Method Get -Headers $Headers
    
    # Display Account Info
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║              ACCOUNT STATEMENT                             ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    $AccountInfo = $StatementData.accountInfo
    if ($AccountInfo) {
        Write-Host "Account Details:" -ForegroundColor Yellow
        Write-Host ("  Account ID:       {0}" -f $AccountInfo.accountId) -ForegroundColor White
        Write-Host ("  Account Number:   {0}" -f $AccountInfo.accountNumber) -ForegroundColor White
        Write-Host ("  Account Name:     {0}" -f $AccountInfo.accountName) -ForegroundColor White
        Write-Host ("  Currency:         {0}" -f $AccountInfo.accountCurrencyCode) -ForegroundColor White
        Write-Host ("  Currency Scale:   {0}" -f $AccountInfo.accountCurrencyScale) -ForegroundColor White
        Write-Host ""
        Write-Host ("  Beginning Balance: {0:N2} {1}" -f $AccountInfo.beginningBalance, $AccountInfo.accountCurrencyCode) -ForegroundColor Cyan
        Write-Host ("  Ending Balance:    {0:N2} {1}" -f $AccountInfo.endingBalance, $AccountInfo.accountCurrencyCode) -ForegroundColor Cyan
        Write-Host ""
    }
    
    # Display Statement Entries
    if ($StatementData.entries -and $StatementData.entries.Count -gt 0) {
        Write-Host "Statement Entries ($($StartDate.ToString('dd MMM yyyy')) - $($EndDate.ToString('dd MMM yyyy'))):" -ForegroundColor Yellow
        Write-Host ("  Total Entries: {0}`n" -f $StatementData.entries.Count) -ForegroundColor Gray
        
        # Format as table
        $StatementData.entries | ForEach-Object {
            [PSCustomObject]@{
                Date        = if ($_.transactionTime) { 
                    ([DateTime]$_.transactionTime).ToString("yyyy-MM-dd HH:mm") 
                } else { 
                    "N/A" 
                }
                Type        = $_.transactionType
                Description = $_.description
                Debit       = if ($_.debitAmount -gt 0) { $_.debitAmount } else { "" }
                Credit      = if ($_.creditAmount -gt 0) { $_.creditAmount } else { "" }
                Balance     = $_.runningBalance
            }
        } | Format-Table -AutoSize
        
        # Summary
        $TotalDebit = ($StatementData.entries | Measure-Object -Property debitAmount -Sum).Sum
        $TotalCredit = ($StatementData.entries | Measure-Object -Property creditAmount -Sum).Sum
        
        Write-Host "`nSummary:" -ForegroundColor Yellow
        Write-Host ("  Total Debits:  {0:N2} {1}" -f $TotalDebit, $AccountInfo.accountCurrencyCode) -ForegroundColor Red
        Write-Host ("  Total Credits: {0:N2} {1}" -f $TotalCredit, $AccountInfo.accountCurrencyCode) -ForegroundColor Green
        Write-Host ("  Net Change:    {0:N2} {1}" -f ($TotalCredit - $TotalDebit), $AccountInfo.accountCurrencyCode) -ForegroundColor Cyan
    }
    else {
        Write-Host "  No transactions found for this period." -ForegroundColor Gray
    }
    
    Write-Host "`n✓ Statement retrieved successfully" -ForegroundColor Green
}
catch {
    Write-Error "Failed to retrieve statement: $_"
    Write-Host "`nAPI URL attempted: $StatementUrl" -ForegroundColor Gray
}

Write-Host "`n=== COMPLETE ===" -ForegroundColor Cyan