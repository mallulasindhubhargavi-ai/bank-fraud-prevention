$ErrorActionPreference = 'Stop'
$projectFolder = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectFolder

$jdkFolder = Join-Path $projectFolder '.tools\jdk\jdk-21.0.12.1+1'
$mavenFolder = Join-Path $projectFolder '.tools\maven\apache-maven-3.10.0'
$tomcatFolder = Join-Path $projectFolder '.tools\tomcat\apache-tomcat-10.1.61'
$warFile = Join-Path $projectFolder 'target\bank-fraud-prevention.war'

if (!(Test-Path (Join-Path $jdkFolder 'bin\java.exe'))) { throw 'Portable JDK is missing. See README.md for setup.' }
if (!(Test-Path (Join-Path $mavenFolder 'bin\mvn.cmd'))) { throw 'Portable Maven is missing. See README.md for setup.' }
if (!(Test-Path (Join-Path $tomcatFolder 'bin\startup.bat'))) { throw 'Portable Tomcat is missing. See README.md for setup.' }

$env:JAVA_HOME = $jdkFolder
$env:PATH = (Join-Path $jdkFolder 'bin') + ';' + $env:PATH
$maven = Join-Path $mavenFolder 'bin\mvn.cmd'
& $maven '-Dmaven.repo.local=.tools/m2' '-DskipTests' 'package'
if ($LASTEXITCODE -ne 0) { throw 'Maven build failed. Review the messages above.' }

$tomcatHttp = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
$appUrl = 'http://localhost:8080/bank-fraud-prevention/'
$appAlreadyRunning = $false
if ($tomcatHttp) {
    try {
        $existingPage = Invoke-WebRequest -Uri $appUrl -TimeoutSec 3 -UseBasicParsing
        $appAlreadyRunning = $existingPage.StatusCode -eq 200
    } catch { $appAlreadyRunning = $false }
    if (!$appAlreadyRunning) { throw 'Port 8080 is in use by another application. Stop it, then run this script again.' }
}

if (!$appAlreadyRunning) {
    Copy-Item -LiteralPath $warFile -Destination (Join-Path $tomcatFolder 'webapps\bank-fraud-prevention.war') -Force
    Start-Process -FilePath (Join-Path $tomcatFolder 'bin\startup.bat') -WorkingDirectory (Join-Path $tomcatFolder 'bin') -WindowStyle Hidden
} else {
    # Tomcat auto-deploys the refreshed WAR if this project's Tomcat is already running.
    Copy-Item -LiteralPath $warFile -Destination (Join-Path $tomcatFolder 'webapps\bank-fraud-prevention.war') -Force
}

for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try {
        $page = Invoke-WebRequest -Uri $appUrl -TimeoutSec 3 -UseBasicParsing
        if ($page.StatusCode -eq 200) { Write-Output "App is running at $appUrl"; exit 0 }
    } catch { Start-Sleep -Seconds 1 }
}
throw "Tomcat did not serve the application at $appUrl. Check .tools\tomcat\apache-tomcat-10.1.61\logs."
