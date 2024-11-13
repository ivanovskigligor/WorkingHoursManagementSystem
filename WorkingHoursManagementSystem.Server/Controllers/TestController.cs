using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : Controller
    {
        [Authorize]
        [HttpGet]
        public IActionResult TestAuth()
        {
            return Ok(new { Message = "Authorization successful!" });
        }
    }
}
