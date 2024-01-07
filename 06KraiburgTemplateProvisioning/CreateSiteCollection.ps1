$siteUrl = "https://devse.dccs-demo.at/sites/sitecoladmin" #DCCS
$listName = "Site Collections"
$templateFilePath = $PSScriptRoot
$sharePointUrl = "https://devse.dccs-demo.at/sites/" #DCCS
$templateLibraryUrl = "/sites/sitecoladmin/Templates" #DCCS

# Load SharePoint PowerShell snap-in if not already loaded
#if ((Get-PSSnapin -Name "Microsoft.SharePoint.PowerShell" -ErrorAction SilentlyContinue) -eq $null) {
#    Add-PSSnapin "Microsoft.SharePoint.PowerShell"
#}

# cdGet the SharePoint web and list
$web = Get-SPWeb $siteUrl
$list = $web.Lists[$listName]

foreach ($item in $list.Items) {
    $newSiteTitle = $item["Title"]
    $newUrlSiteName = $item["UrlSiteName"]
    $newSiteUrl = $sharePointUrl + $newUrlSiteName
    $newSiteAdmin = $item["SiteAdmin"]
    $templateName = $item["Select_x0020_Template"]
   
    $index = $templateName.IndexOf("#")
    if ($index -ne -1) {
        # Remove everything before and including '#'
        $templateName = $templateName.Substring($index + 1) + ".pnp"
    } else {
    }


    $siteExists = Get-SPSite -Identity $newSiteUrl -ErrorAction SilentlyContinue

    if ($null -eq $siteExists -and $newSiteTitle -ne "Template") {
        try {
            # Create the new site collection using a default template
            $newSite = New-SPSite -Url $newSiteUrl -OwnerAlias $newSiteAdmin -Name $newSiteTitle -Template "STS#3" -ErrorAction Stop

            # Connect to the admin site collection
            Connect-PnPOnline -Url $siteUrl -CurrentCredentials

            # Download the template
            Get-PnPFile -Url "$templateLibraryUrl/$templateName" -Path $templateFilePath -AsFile
            $templateFilePath = $templateFilePath + "\$templateName"

            # Create Link DML and Link DMS
            $itemId = $item["ID"] | Out-String
            
            # Update the list item
            $null = Set-PnPListItem -List $listName -Identity $itemId -Values @{"URL" = $newSiteUrl}
            Disconnect-PnPOnline

            # Apply the template
            Connect-PnPOnline -Url $newSiteUrl -CurrentCredentials
            Get-PnPNavigationNode -Location QuickLaunch | Remove-PnPNavigationNode -Force
            $null = Apply-PnPProvisioningTemplate -Path $templateFilePath -WarningAction SilentlyContinue
            Remove-Item -Path $templateFilePath -Force



            # Create AD Groups
            Connect-PnPOnline -Url $siteUrl -CurrentCredentials
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

                    $OwnerGroupName = $newUrlSiteName + " Owners"
                    $MemberGroupName = $newUrlSiteName + " Members"
                    $ReaderGroupName = $newUrlSiteName + " Readers"
                    CreateADGroupAndAddUsers -groupName $OwnerGroupName -users $ownerArr
                    CreateADGroupAndAddUsers -groupName $MemberGroupName -users $memberArr
                    CreateADGroupAndAddUsers -groupName $ReaderGroupName -users $readerArr

                     $null = Set-PnPListItem -List $listName -Identity $itemId -Values @{"OwnerGroupName" = $OwnerGroupName; "MemberGroupName" = $MemberGroupName; "ReaderGroupName" = $ReaderGroupName}
                }





            Write-Host "Site collection created and template applied at $newSiteUrl" -ForegroundColor Green
        } catch {
            Write-Host "An error occurred: $_.Exception.Message" -ForegroundColor Red
        }
    } else {
        Write-Host "Site collection already exists at $newSiteUrl" -ForegroundColor Yellow
    }
}
$web.Dispose()
