@echo off
echo Fixing Vercel deployment for Mehari project...
echo.

REM Create vercel.json configuration
echo { > vercel.json
echo   "builds": [ >> vercel.json
echo     { >> vercel.json
echo       "src": "mehari-supplychain/package.json", >> vercel.json
echo       "use": "@vercel/static-build", >> vercel.json
echo       "config": { >> vercel.json
echo         "distDir": "mehari-supplychain/dist" >> vercel.json
echo       } >> vercel.json
echo     } >> vercel.json
echo   ], >> vercel.json
echo   "routes": [ >> vercel.json
echo     { >> vercel.json
echo       "src": "/(.*)", >> vercel.json
echo       "dest": "/mehari-supplychain/dist/$1" >> vercel.json
echo     } >> vercel.json
echo   ] >> vercel.json
echo } >> vercel.json

echo.
echo Created vercel.json configuration.
echo.
echo Now run:
echo git add vercel.json
echo git commit -m "Add Vercel configuration"
echo git push origin main
echo.
echo Then redeploy on Vercel.
pause