using Microsoft.EntityFrameworkCore;
using TempleManagementApi.Models;

namespace TempleManagementApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Devotee> Devotees { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Enforce constraints
            modelBuilder.Entity<Devotee>()
                .HasIndex(d => d.Email)
                .IsUnique();

            modelBuilder.Entity<Devotee>()
                .HasIndex(d => d.PhoneNumber)
                .IsUnique();
        }
    }
}
