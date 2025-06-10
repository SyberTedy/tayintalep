cd API
dotnet restore
cd ../
cd WebSite
npm install
cd ../
del "%USERPROFILE%\TransferRequestAppDB.mdf"
del "%USERPROFILE%\TransferRequestAppDB_log.ldf"
sqlcmd -S (LocalDB)\MSSQLLocalDB -i TransferRequestAppDB.sql
