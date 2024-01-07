if ((Get-PSSnapin -Name "Microsoft.SharePoint.PowerShell" -ErrorAction SilentlyContinue) -eq $null) {
    Add-PSSnapin "Microsoft.SharePoint.PowerShell"
}

$siteUrl = "https://devse.dccs-demo.at/sites/sitecoladmin"
Connect-PnPOnline -Url $siteUrl -CurrentCredentials

# Get list items
$listItems = Get-PnPListItem -List "Site Collections"

# Function to create AD group and add users
Function CreateADGroupAndAddUsers {
    param (
        [string]$groupName,
        [array]$users
    )

    # Check if group exists
    $group = Get-ADGroup -Filter { Name -eq $groupName } -ErrorAction SilentlyContinue

    # Create group if not exists
    if (-not $group) {
        New-ADGroup -Name $groupName -GroupScope Global -Path "OU=SPSE Service Accounts,DC=dccs-demo,DC=at" # Change the path as needed
    }

    # Add users to group
    foreach ($user in $users) {
        Add-ADGroupMember -Identity $groupName -Members $user # Assuming UserPrincipalName is available
    }
}

# Process each item in the list
foreach ($item in $listItems) {
    # Extract users from each column
    $owners = $item["Owner"] 
    $ownerArr = @()
    foreach ($owner in $owners) {
        $user = Get-PnPUser -Identity $owner.LookupId
        $ownerArr += $user.LoginName -replace '.*\\', ''
    }

    $members = $item["Member"]
    $memberArr = @()
    foreach ($member in $members) {
        $user = Get-PnPUser -Identity $member.LookupId
        $memberArr += $user.LoginName -replace '.*\\', ''
    }
    $readers = $item["Reader"]
    $readerArr = @()
    foreach ($reader in $readers) {
        $user = Get-PnPUser -Identity $reader.LookupId 
        $readerArr += $user.LoginName -replace '.*\\', ''
    }

    CreateADGroupAndAddUsers -groupName "TestOwner" -users $ownerArr
    CreateADGroupAndAddUsers -groupName "TestMember" -users $memberArr
    CreateADGroupAndAddUsers -groupName "TestReader" -users $readerArr
}
