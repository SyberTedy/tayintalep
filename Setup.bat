cd API
dotnet restore
cd ../
del "%USERPROFILE%\TransferRequestAppDB.mdf"
del "%USERPROFILE%\TransferRequestAppDB_log.ldf"
sqlcmd -S (LocalDB)\MSSQLLocalDB -i TransferRequestAppDB.sql