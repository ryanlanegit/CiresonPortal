@ECHO OFF
ECHO RequireJS Build Script starting. >> built.log
ECHO ************************************************ >> built.log
ECHO Administrative permissions required. Detecting permissions...
net session >nul 2>&1
IF %errorLevel% == 0 (
    ECHO Success: Administrative permissions confirmed. >> built.log
    cd "C:\inetpub\CiresonPortal\CustomSpace\build"
    ECHO ************************************************ >> built.log
    ECHO Building \Scripts\viewMain.js >> built.log
    node "C:\Users\ryanlane\AppData\Roaming\npm\node_modules\requirejs\bin\r.js" -o build-viewMain.js >> built.log
    ECHO ************************************************ >> built.log
    ECHO Building \Scripts\forms\profileMain.js >> built.log
    node "C:\Users\ryanlane\AppData\Roaming\npm\node_modules\requirejs\bin\r.js" -o build-profileMain.js >> built.log
    ECHO ************************************************ >> built.log
    ECHO Building \Scripts\forms\wiMain.js >> built.log
    node "C:\Users\ryanlane\AppData\Roaming\npm\node_modules\requirejs\bin\r.js" -o build-wiMain.js >> built.log
    :: ECHO ************************************************ >> built.log
    :: ECHO Building \Scripts\forms\wiActivityMain.js >> built.log
    :: node "C:\Users\ryanlane\AppData\Roaming\npm\node_modules\requirejs\bin\r.js" -o build-wiActivityMain.js >> built.log
    :: ECHO ************************************************ >> built.log
    :: ECHO Building \CustomSpace\build\customTasks.js >> built.log
    :: node "C:\Users\ryanlane\AppData\Roaming\npm\node_modules\requirejs\bin\r.js" -o build-customTasks.js >> built.log
) ELSE (
    ECHO Failure: Current permissions inadequate. >> built.log
)

ECHO ************************************************ >> built.log
ECHO RequireJS Build Script completed. >> built.log
PAUSE