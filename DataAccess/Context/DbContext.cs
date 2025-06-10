using Microsoft.EntityFrameworkCore;
using TayinProgrami.Models.Dtos;
using TayinProgrami.Models.Entities;

namespace TayinProgrami.DataAccess.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

        public DbSet<User> User { get; set; }
        public DbSet<TransferRequest> TransferRequest { get; set; }
        public DbSet<TransferRequestSource> TransferRequestSource { get; set; }
        public DbSet<CourthousePreference> CourthousePreference { get; set; }
        public DbSet<TransferRequestType> TransferRequestType { get; set; }
        public DbSet<Courthouse> Courthouse { get; set; }
        public DbSet<LogEntry> LogEntry { get; set; }
        public DbSet<Permission> Permission { get; set; }
        public DbSet<Title> Title { get; set; }
        public DbSet<TransferRequestStatu> TransferRequestStatu { get; set; }
        public DbSet<UserPermissionClaim> UserPermissionClaim { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>();
            modelBuilder.Entity<TransferRequest>();
            modelBuilder.Entity<TransferRequestSource>();
            modelBuilder.Entity<CourthousePreference>();
            modelBuilder.Entity<TransferRequestType>();
            modelBuilder.Entity<Courthouse>();
            modelBuilder.Entity<LogEntry>();
            modelBuilder.Entity<Permission>();
            modelBuilder.Entity<Title>();
            modelBuilder.Entity<TransferRequestStatu>();
            modelBuilder.Entity<UserPermissionClaim>();
        }

    }
}
