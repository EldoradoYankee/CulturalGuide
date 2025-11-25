namespace CulturalGuideBACKEND.Controllers;

using CulturalGuideBACKEND.Data;
using CulturalGuideBACKEND.Models;
using LoginRequest = DefaultNamespace.LoginRequest;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    
    private readonly IConfiguration _config;
    private readonly IPasswordHasher<User> _passwordHasher;

    [AllowAnonymous]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        var email = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value;
        return Ok(new { userId, email });
    }
    
    public AuthController(
        AppDbContext db,
        IConfiguration config,
        IPasswordHasher<User> passwordHasher)
    {
        _db = db;
        _config = config;
        _passwordHasher = passwordHasher;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        return Ok(await _db.Users.ToListAsync());
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
    }
    
    [AllowAnonymous]
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // debug log
        Console.WriteLine($"Login attempt: ", request.Email);
        
        var user = _db.Users.FirstOrDefault(u => u.Email == request.Email);
        if (user == null)
            return Unauthorized("User not found");

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        
        // debug log
        Console.WriteLine($"Should be Success or SuccessRehashNeeded: ", result); // Should be Success or SuccessRehashNeeded

        
        if (result == PasswordVerificationResult.Failed)
            return Unauthorized("Invalid password");

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            }),
            Expires = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpireMinutes"]!)),
            Issuer = _config["Jwt:Issuer"],
            Audience = _config["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwt = tokenHandler.WriteToken(token);

        Response.Cookies.Append("access_token", jwt, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpireMinutes"]!))
        });

        return Ok(new { token = jwt, user.Email, user.Name });
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest("Invalid data");

        // Check email duplicates
        var existingUser = _db.Users.FirstOrDefault(u => u.Email == request.Email);
        if (existingUser != null)
            return Conflict("Email already registered");

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordResetToken = null,
            PasswordResetTokenExpires = null
        };

        // Hash password
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        // Save user in DB
        _db.Users.Add(user);
        _db.SaveChanges();

        // Create JWT
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            }),
            Expires = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpireMinutes"]!)),
            Issuer = _config["Jwt:Issuer"],
            Audience = _config["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwt = tokenHandler.WriteToken(token);

        Response.Cookies.Append("access_token", jwt, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpireMinutes"]!))
        });

        return Ok(new { token = jwt, user.Email, user.Name });
    }    
    

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // Remove cookie
        Response.Cookies.Delete("access_token");
        return Ok(new { message = "Logged out" });
    }
}
