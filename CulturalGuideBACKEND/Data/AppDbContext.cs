using Microsoft.EntityFrameworkCore;
using CulturalGuideBACKEND.Models;

namespace CulturalGuideBACKEND.Data;



public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
}
