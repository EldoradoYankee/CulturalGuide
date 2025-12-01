using CulturalGuideBACKEND.Data;
using CulturalGuideBACKEND.Models;
using CulturalGuideBACKEND.Services.Email;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------
// 1) SERVICES (valid here)
// ---------------------------
builder.Services.AddControllers();

builder.Services.AddOpenApi();

// Db
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ??
                      "Data Source=app.db"));

// Password hasher
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactDev", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // important for cookies
    });
});

// JWT Auth Service
var jwtSection = builder.Configuration.GetSection("Jwt");
var key = jwtSection.GetValue<string>("Key")!;
var issuer = jwtSection.GetValue<string>("Issuer")!;
var audience = jwtSection.GetValue<string>("Audience")!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = true,
            ValidAudience = audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            ValidateLifetime = true,
        };
    });

// Email service
builder.Services.AddScoped<IEmailService, EmailService>();

// Fluent Email
//builder.Services.AddFluentEmail("no-reply@yourapp.com")
//    .AddSmtpSender("smtp.server.com", 587, "smtp-user", "smtp-password");


// ------------------------------------------------------
// 2) BUILD (after this point, no more AddServices!)
// ------------------------------------------------------
var app = builder.Build();

// ---------------------------
// 3) MIDDLEWARE
// ---------------------------
//app.UseHttpsRedirection();

app.UseCors("AllowReactDev"); // must come BEFORE Authentication/Authorization

app.UseAuthentication();
app.UseAuthorization(); // prevent No 'Access-Control-Allow-Origin' header is present error in client

app.MapControllers();

// ---------------------------
// 4) DB Seed (allowed here)
// ---------------------------
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    if (!db.Users.Any())
    {
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();

        var u = new User
        {
            Email = "test@example.com",
            Name = "Test User",
            EmailVerified = true
        };

        u.PasswordHash = hasher.HashPassword(u, "Password123");
        db.Users.Add(u);
        db.SaveChanges();
    }
}

app.Run();
