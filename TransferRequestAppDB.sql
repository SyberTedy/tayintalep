IF EXISTS (SELECT name FROM sys.databases WHERE name = 'TransferRequestAppDB')
BEGIN
    DROP DATABASE TransferRequestAppDB;
END
GO

CREATE DATABASE TransferRequestAppDB COLLATE Turkish_CI_AS;
GO


USE TransferRequestAppDB;
GO

CREATE TABLE Courthouse (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL
);

CREATE TABLE Permission (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL
);

CREATE TABLE Title (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL
);

CREATE TABLE TransferRequestStatu (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL
);

CREATE TABLE TransferRequestType (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL
);

CREATE TABLE [User] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TCNo NVARCHAR(100) NOT NULL,
    RegistratioNumber INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Surname NVARCHAR(100) NOT NULL,
    EMail NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(100) NOT NULL,
    TitleId INT NOT NULL,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    ActiveCourthouseId INT NOT NULL,
    CreatedAt DATETIME NOT NULL,
);

CREATE TABLE UserPermissionClaim (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PermissionId INT NOT NULL,
    UserId INT NOT NULL,
);

CREATE TABLE TransferRequest (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TypeId INT NOT NULL,
    CreatedAt DATETIME NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    UserId INT NOT NULL,
    StatuId INT NOT NULL,
    ApprovedCourthousePreferenceId INT
);

CREATE TABLE CourthousePreference (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CourthouseId INT NOT NULL,
    TransferRequestId INT NOT NULL,
    PreferenceOrder INT NOT NULL
);

CREATE TABLE TransferRequestSource (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PathName NVARCHAR(500) NOT NULL,
    TransferRequestId INT NOT NULL
);

CREATE TABLE LogEntry (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Date DATETIME NOT NULL,
    Level NVARCHAR(50) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    Exception NVARCHAR(MAX) NULL,
    RegistratioNumber NVARCHAR(50) NOT NULL,
    ControllerName NVARCHAR(100) NOT NULL,
    ActionName NVARCHAR(100) NOT NULL,
    IpAddress NVARCHAR(100) NOT NULL
);

DECLARE @NowTurkeyTime DATETIMEOFFSET = SYSDATETIMEOFFSET() AT TIME ZONE 'Turkey Standard Time';

INSERT INTO [User] (TCNo, RegistratioNumber, Name, Surname, EMail, Phone, TitleId, PasswordHash, ActiveCourthouseId, CreatedAt)
VALUES
('12132312132', 121323, 'Ali', 'Keser', 'ali.keser@example.com', '5551112233', 1, '$2a$11$zhUrT2JtkO9A8AAWwDi0I.qgmubJcRb1csuZNWQDxpOJ3L9NSlXdm', 3, @NowTurkeyTime),
('32312132312', 323121, 'Merve', 'Seren', 'merve.seren@example.com', '5552223344', 2, '$2a$11$X8Sw5iqnHyNQwtPXCWowd.xItouMnHISy3GFEnKMP.EDaM59oUgrm', 5, @NowTurkeyTime),
('22133222133', 221332, 'Esra', 'Kiraz', 'esra.kiraz@example.com', '5553334455', 3, '$2a$11$8YnAOwHUNLnraGAVPy6qBOoq7FjtWxtLstLmBNqHuQZ4DhrUcMglO', 23, @NowTurkeyTime),
('21132221132', 211322, 'Erdem', 'Akdemir', 'erdem.akdemir@example.com', '5554445566', 4, '$2a$11$4VS8hTGh07TRZWWg61P7rOji1ThjsSfQHdx2K2lXiaOR795RwIj4q', 67, @NowTurkeyTime),
('26716726716', 267167, 'Kerem', 'Soy', 'kerem.soy@example.com', '5555556677', 5, '$2a$11$Md/G.yjIC9nGuXerr47jTOPeSwTOtpjgH5LO5wUeALKPqBprSXNX2', 79, @NowTurkeyTime),
('18928918928', 189289, 'Yusuf', 'Faysak', 'yusuf.faysak@example.com', '5556667788', 1, '$2a$11$EEbMfBzk.EdIVHs09tcgR.rS65S0UEpd/x7WyYx082kgQee7q.q4G', 21, @NowTurkeyTime),
('17628717628', 176287, 'Ebru', 'Candan', 'ebru.candan@example.com', '5557778899', 2, '$2a$11$569oHbDTT0JetZJPmSX9e.GN7yJpS9QeKhBoQ./yy5GJUQ2Qnvasq', 24, @NowTurkeyTime),
('21331221331', 213312, 'Ahmet', 'Demir', 'ahmet.demir@example.com', '5558889900', 3, '$2a$11$Bdta0K48cJ1C4cssIYeaMukUav7eUHmae01jLoWBUfj3ovznhYVVu', 48, @NowTurkeyTime),
('98456984569',  98456,  'Sinan', 'Yurtsever', 'sinan.yurtsever@example.com', '5559990011', 6, '$2a$11$lcbZLTAJMDbsaXO49dGlf.4M6MNuesyCYXLPO.Y1Ev9XBPxBlzz1G', 36, @NowTurkeyTime);

-- sorguyu çalıştrdığımda dosya UTF-8 (Without BOM) tipinde okunmasına ve Turkish_CI_AS tipinde collate etmeme ramen türkçe karakterleri 
-- kabul etmedi çözemedim bu nedenle ünvanlardaki Türkçe karakterlerle ilgili bir sorun oldu ama yeni kayıt oluşturulduğunda program üzerinden 
-- böyle bir sorunla karışlaşmayacaksınız sadece queryde böyle bir problem yaşadım sonuç olarak sistem çalışıyor ama ünvanları
-- biraz farklı kaydediyor bu sorgu sonucu veri tabanımıza 
INSERT INTO [Title] (Name)
VALUES 
('Zabıt Katibi'),
('Yazı İşleri Müdürü'),
('Mübaşir'),
('Memur'),
('Savcı'),
('Mühendis');

-- aynı şekilde adliye isimleri de biraz problemli düşecektir veri tabanına ama bunları sisteme manuel olarak eklediğinide
-- bu sorunun ortadan kalktığını görebilirsiniz
INSERT INTO Courthouse (Name)
VALUES
('Adana Adliyesi'),
('Adıyaman Adliyesi'),
('Afyonkarahisar Adliyesi'),
('Ağrı Adliyesi'),
('Amasya Adliyesi'),
('Ankara Adliyesi'),
('Antalya Adliyesi'),
('Artvin Adliyesi'),
('Aydın Adliyesi'),
('Balıkesir Adliyesi'),
('Bilecik Adliyesi'),
('Bingöl Adliyesi'),
('Bitlis Adliyesi'),
('Bolu Adliyesi'),
('Burdur Adliyesi'),
('Bursa Adliyesi'),
('Çanakkale Adliyesi'),
('Çankırı Adliyesi'),
('Çorum Adliyesi'),
('Denizli Adliyesi'),
('Diyarbakır Adliyesi'),
('Edirne Adliyesi'),
('Elazığ Adliyesi'),
('Erzincan Adliyesi'),
('Erzurum Adliyesi'),
('Eskişehir Adliyesi'),
('Gaziantep Adliyesi'),
('Giresun Adliyesi'),
('Gümüşhane Adliyesi'),
('Hakkâri Adliyesi'),
('Hatay Adliyesi'),
('Isparta Adliyesi'),
('Mersin Adliyesi'),
('İstanbul Adliyesi'),
('İzmir Adliyesi'),
('Kars Adliyesi'),
('Kastamonu Adliyesi'),
('Kayseri Adliyesi'),
('Kırklareli Adliyesi'),
('Kırşehir Adliyesi'),
('Kocaeli Adliyesi'),
('Konya Adliyesi'),
('Kütahya Adliyesi'),
('Malatya Adliyesi'),
('Manisa Adliyesi'),
('Kahramanmaraş Adliyesi'),
('Mardin Adliyesi'),
('Muğla Adliyesi'),
('Muş Adliyesi'),
('Nevşehir Adliyesi'),
('Niğde Adliyesi'),
('Ordu Adliyesi'),
('Rize Adliyesi'),
('Sakarya Adliyesi'),
('Samsun Adliyesi'),
('Siirt Adliyesi'),
('Sinop Adliyesi'),
('Sivas Adliyesi'),
('Tekirdağ Adliyesi'),
('Tokat Adliyesi'),
('Trabzon Adliyesi'),
('Tunceli Adliyesi'),
('Şanlıurfa Adliyesi'),
('Uşak Adliyesi'),
('Van Adliyesi'),
('Yozgat Adliyesi'),
('Zonguldak Adliyesi'),
('Aksaray Adliyesi'),
('Bayburt Adliyesi'),
('Karaman Adliyesi'),
('Kırıkkale Adliyesi'),
('Batman Adliyesi'),
('Şırnak Adliyesi'),
('Bartın Adliyesi'),
('Ardahan Adliyesi'),
('Iğdır Adliyesi'),
('Yalova Adliyesi'),
('Karabük Adliyesi'),
('Kilis Adliyesi'),
('Osmaniye Adliyesi'),
('Düzce Adliyesi');

INSERT INTO TransferRequestType (Name)
VALUES 
('Eğitim Nedeniyle Tayin'),
('Sağlık Nedeniyle Tayin'),
('Eş Durumu Nedeniyle Tayin'),
('Can Güvenliği Nedeniyle Tayin');

INSERT INTO Permission (Name)
VALUES 
('Admin'),
('Courthouse.Create'),
('Courthouse.Delete'),
('LogEntry.GetAll'),
('Title.Create'),
('Title.Delete'),
('TransferRequest.GetAllUsers'),
('TransferRequest.UpdateApproveStatus'),
('TransferRequestType.Create'),
('TransferRequestType.Delete'),
('UserPermissionClaim.Create'),
('UserPermissionClaim.Delete'),
('User.Register'),
('User.GetAll');

INSERT INTO TransferRequestStatu (Name)
VALUES 
('Pending'),
('Approved'),
('Rejected'),
('Cancelled');

INSERT INTO UserPermissionClaim (PermissionId, UserId)
VALUES 
(1, 9);