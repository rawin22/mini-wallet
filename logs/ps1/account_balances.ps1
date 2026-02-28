# 1. Configuration from appsettings.json
$BaseUrl  = "https://www.bizcurrency.com:20200/api/v1"
$CallerId = "819640E9-8DF1-4DB9-B13B-E9DCDDEEBA58" # Mandatory Beta CallerId

# 2. User Credentials
# 2. User Credentials
$Username = "ralf"
$Password = "1oxPublic26"
# 3. Authenticate to obtain Bearer Token and OrganizationId
$AuthBody = @{
    loginId                             = $Username
    password                            = $Password
    callerId                            = $CallerId
    includeUserSettingsInResponse       = $true
    includeAccessRightsWithUserSettings = $false
} | ConvertTo-Json

Write-Host "Authenticating with $BaseUrl..." -ForegroundColor Cyan
try {
    $AuthResponse = Invoke-RestMethod -Uri "$BaseUrl/authenticate" `
                                      -Method Post `
                                      -Body $AuthBody `
                                      -ContentType "application/json"

    $Token      = $AuthResponse.tokens.accessToken
    $CustomerId = $AuthResponse.userSettings.organizationId # DTO: OrganizationId maps to CustomerId

    if (-not $Token) { throw "Authentication failed." }
    Write-Host "Login Successful." -ForegroundColor Green
}
catch {
    Write-Error "Authentication Error: $_"
    exit
}

# 4. Get Balance Data using specific DTO property names
$Headers = @{ "Authorization" = "Bearer $Token" }

Write-Host "Retrieving balances..." -ForegroundColor Cyan
try {
    $BalanceUrl = "$BaseUrl/CustomerAccountBalance/$CustomerId"
    $Data = Invoke-RestMethod -Uri $BalanceUrl -Method Get -Headers $Headers

    # 5. Display formatted results using EXACT DTO property names
    Write-Host "`n--- Current Wallet Balances ---" -ForegroundColor Yellow
    $Data.balances | ForEach-Object {
        [PSCustomObject]@{
            # These names match the CustomerBalanceData class in your DTO
            Currency  = $_.currencyCode
            Available = $_.balanceAvailable
            Reserved  = $_.activeHoldsTotal
            Total     = $_.balance
        }
    } | Format-Table -AutoSize
}
catch {
    Write-Error "Failed to retrieve balances: $_"
}