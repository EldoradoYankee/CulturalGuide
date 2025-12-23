using Microsoft.EntityFrameworkCore;
using CulturalGuideBACKEND.Models;

namespace CulturalGuideBACKEND.Data;



public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<User> Users { get; set; }
    
    public DbSet<Municipality> Municipalities { get; set; }
    
	public DbSet<EatAndDrink> EatAndDrink { get; set; }
}
