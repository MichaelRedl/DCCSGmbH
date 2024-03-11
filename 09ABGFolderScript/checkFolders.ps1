param (
    [string]$folderToDelete
)

# Variables
$siteUrl = "https://abgffm.sharepoint.com/teams/ExterneFreigabe/Dokumentenfreigabe/"
$libraryName = "LibraryName"
$csvFilePath = ".\Expired Folders.csv"
$expirationDateColumn = "ExpirationDate"

Import-Module PnP.PowerShell -ErrorAction Stop

Connect-PnPOnline -Url $siteUrl -UseWebLogin
function Get-FolderUrl {
    param (
        [string]$name
    )
    
    try{
        $urlToDelete = "$libraryName/$name" 
        $doesExist = Get-PnPFolder -Url $urlToDelete -ErrorAction SilentlyContinue
         if ($doesExist -ne $null) {
            return $libraryName+"/"+$name
         }
        else {
            $folders = Get-PnPFolderItem -Identity $libraryName
            foreach ($item in $folders) {
                try {
                    $urlToDelete = $libraryName+"/"+$item.Name+"/"+$name
                    $doesExist = Get-PnPFolder -Url $urlToDelete -ErrorAction SilentlyContinue
                     if ($doesExist -ne $null) {
                        return $libraryName+"/"+$item.Name+"/"+$name
                     }
                }
                catch {
                    Write-Host "Could not find folder URL" -Foregroundcolor Red
                }
            }
            return $libraryName+"/"+$name
        }
    }
    catch {
       
    }

}

# Check if a folder should be deleted before proceeding
if (-not [string]::IsNullOrWhiteSpace($folderToDelete)) {
    $folderToDeleteUrl = Get-FolderUrl -name $folderToDelete
    $lastSlashPosition = $folderToDeleteUrl.LastIndexOf("/")
    $beforeLastSlash = $folderToDeleteUrl.Substring(0, $lastSlashPosition)
    try {
        $deleteTheFolder = Get-PnPFolder -Url $folderToDeleteUrl -ErrorAction SilentlyContinue
        if ($deleteTheFolder -ne $null) {
            Remove-PnPFolder -Name $folderToDelete -Folder $beforeLastSlash -Recycle -Force
            Write-Host "Folder ""$folderToDelete"" deleted successfully." -Foregroundcolor Green
        } else {
            Write-Host "Folder ""$folderToDelete"" does not exist and therefore cannot be deleted." -Foregroundcolor Yellow
        }
    } catch {
        Write-Host "An error occurred while trying to delete folder '$folderToDelete': $_" -Foregroundcolor Red
    }
}

# Get all folders from the library and save expired folder names to a csv file
$folderItems = Get-PnPListItem -List $libraryName
$expiredFolders = @()
$number = 0

foreach ($folder in $folderItems) {
   
    If($folderItems[$number].Id){

        $folderProperties = Get-PnPListItem -List $libraryName -Id $folderItems[$number].Id
        $folderUrl = $folderProperties["FileRef"]
        $folderName = $folderUrl.Split('/')[-1]
        $expirationDate = $folderProperties[$expirationDateColumn]

         if ($expirationDate -and (Get-Date $expirationDate) -lt (Get-Date)) {
            Write-Host "The folder ""$folderName "" is expired with the expiration date " $expirationDate -Foregroundcolor Yellow
            $expiredFolders += [PSCustomObject]@{
            "Folder Name" = $folderName
            "Expiration Date" = $expirationDate
        }
    }
        }

    $number = $number + 1
}

if ($expiredFolders.Count -gt 0) {
    $expiredFolders | Export-Csv -Path $csvFilePath -NoTypeInformation -Delimiter ";"
    Write-Host "Expired folders have been written to '$csvFilePath'" -Foregroundcolor Green
} else {
    Write-Host "No expired folders found."
}

