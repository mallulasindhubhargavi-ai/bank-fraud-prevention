$ErrorActionPreference = 'Stop'
$projectFolder = Split-Path -Parent $MyInvocation.MyCommand.Path
$tomcatFolder = Join-Path $projectFolder '.tools\tomcat\apache-tomcat-10.1.61'
$jdkFolder = Join-Path $projectFolder '.tools\jdk\jdk-21.0.12.1+1'
if (!(Test-Path (Join-Path $tomcatFolder 'bin\shutdown.bat'))) { throw 'Portable Tomcat is missing.' }
$env:JAVA_HOME = $jdkFolder
$env:PATH = (Join-Path $jdkFolder 'bin') + ';' + $env:PATH
Start-Process -FilePath (Join-Path $tomcatFolder 'bin\shutdown.bat') -WorkingDirectory (Join-Path $tomcatFolder 'bin') -Wait -WindowStyle Hidden
Write-Output 'Tomcat shutdown requested.'
