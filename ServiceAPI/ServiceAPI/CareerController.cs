using Microsoft.AspNetCore.Mvc;
using ServiceAPI.Dal;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using System.Threading;
using MongoDB.Bson;
using MongoDB.Driver;
namespace ServiceAPI
{
    [Route("api")]
   public class CareerController : Controller
    {
        static readonly object setupLock = new object();
        static readonly SemaphoreSlim parallelism = new SemaphoreSlim(2);
        static MongodbContex dbcontex = new MongodbContex();

        [HttpGet("careers")]
        public async Task<IActionResult> GetCareers()
        {
            try
            {
                await parallelism.WaitAsync();


                return Ok(await dbcontex.Careers.Find(new BsonDocument()).ToListAsync());

            }
            finally
            {
                parallelism.Release();
            }
        }

        [HttpGet("career")]
        public async Task<IActionResult> GetCareer([FromQuery]int id)
        {

            return Ok(await dbcontex.Careers.Find(Builders<Career>.Filter.Eq("Id", id)).FirstAsync());
        }
        [HttpGet("car")]
        public async Task<IActionResult> GetCareerName([FromQuery]string name)
        {
            var careers = await dbcontex.Careers.Find(Builders<Career>.Filter.Where(x=>x.Name.ToLower().StartsWith(name.ToLower()))).ToListAsync();

           
            return Ok(careers);
        }
        [HttpGet("careers/courses")]
        public async Task<IActionResult> Getcourse([FromQuery]int id)
        {
            return Ok(await dbcontex.Careers.Find(Builders<Career>.Filter.Ne("Id", id)).FirstAsync());
           
        }


        [HttpPut("careers")]
        public async Task<IActionResult> CreateCareer([FromBody]Career career)
        {
            career.Id = (int)dbcontex.Careers.Count(x => true) + 1;
            await dbcontex.Careers.InsertOneAsync(career);

            return Ok();

        }

        [HttpPost("careers")]
        public async Task<IActionResult> UpdateCareer([FromBody]Career career)
        {
            var query = Builders<Career>.Filter.Eq(x => x.Id, career.Id);
            await dbcontex.Careers.ReplaceOneAsync(query, career);
            return Ok();

        }
        [HttpDelete("careers")]
        public async Task<IActionResult> DeleteCareer([FromQuery]int id)
        {
            await dbcontex.Careers.DeleteOneAsync(Builders<Career>.Filter.Eq("Id", id));
            return Ok();



        }
    }
}
