using Microsoft.EntityFrameworkCore;
using RCTableEditor.Server.Models;

namespace RCTableEditor.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<SessionData> SessionData { get; set; }
        public DbSet<ChangeHistory> ChangeHistory { get; set; }
        public DbSet<ChangeDetail> ChangeDetails { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure SessionData entity
            modelBuilder.Entity<SessionData>()
                .HasKey(s => s.SessionDataId);

            modelBuilder.Entity<SessionData>()
                .Property(s => s.BatchId)
                .IsRequired();

            // Configure ChangeHistory entity
            modelBuilder.Entity<ChangeHistory>()
                .HasKey(c => c.ChangeId);

            // Configure ChangeDetail entity
            modelBuilder.Entity<ChangeDetail>()
                .HasKey(c => c.ChangeDetailId);

            modelBuilder.Entity<ChangeDetail>()
                .HasOne<ChangeHistory>()
                .WithMany()
                .HasForeignKey(c => c.ChangeId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
