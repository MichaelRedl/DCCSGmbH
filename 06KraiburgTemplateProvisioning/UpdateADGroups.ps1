#if ((Get-PSSnapin -Name "Microsoft.SharePoint.PowerShell" -ErrorAction SilentlyContinue) -eq $null) {
#    Add-PSSnapin "Microsoft.SharePoint.PowerShell"
#}
$listName = "Site Collections"
$siteUrl = "https://devse.dccs-demo.at/sites/sitecoladmin"
Connect-PnPOnline -Url $siteUrl -CurrentCredentials

# Get list items
$listItems = Get-PnPListItem -List $listName

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
        New-ADGroup -Name $groupName -GroupScope Global -Path "OU=SPSE Service Accounts,DC=dccs-demo,DC=at" 
    }

    # Clear group before adding new users
    ClearADGroup -groupName $groupName

    # Add users to group
    foreach ($user in $users) {
        Add-ADGroupMember -Identity $groupName -Members $user 
    }
}

# Function to clear ad group
Function ClearADGroup {
    param (
        [string]$groupName
    )

    # Get the group
    $group = Get-ADGroup -Filter { Name -eq $groupName } -ErrorAction SilentlyContinue
    if ($group) {
        # Get group members
        $groupMembers = Get-ADGroupMember -Identity $groupName -ErrorAction SilentlyContinue
        if ($groupMembers) {
            # Remove all members
            Remove-ADGroupMember -Identity $groupName -Members $groupMembers -Confirm:$false
        }
    }
}

# Process each item in the list
foreach ($item in $listItems) {
    $updateADGroup = $item["Update_x0020_AD_x0020_Groups"];
    $itemId = $item["ID"] | Out-String
    $itemTitle = $item['Title']
    $newUrlSiteName = $item["UrlSiteName"]
    if($updateADGroup -eq "yes"){


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

        $OwnerGroupName = $newUrlSiteName + " Owners"
        $MemberGroupName = $newUrlSiteName + " Members"
        $ReaderGroupName = $newUrlSiteName + " Readers"
        CreateADGroupAndAddUsers -groupName $OwnerGroupName -users $ownerArr
        CreateADGroupAndAddUsers -groupName $MemberGroupName -users $memberArr
        CreateADGroupAndAddUsers -groupName $ReaderGroupName -users $readerArr
        $null = Set-PnPListItem -List $listName -Identity $itemId -Values @{"Update_x0020_AD_x0020_Groups" = "AD groups updated"}
        Write-Host "AD Groups updated for $itemTitle" -ForegroundColor Green
    }
}
