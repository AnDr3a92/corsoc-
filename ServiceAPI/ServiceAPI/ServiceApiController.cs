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
    public class ServiceApiController : Controller
    {
        static readonly object setupLock = new object();
        static readonly SemaphoreSlim parallelism = new SemaphoreSlim(2);
        static MongodbContex dbcontex = new MongodbContex();
        [HttpGet("setup")]
        public IActionResult SetupDatabase()
        {
            lock (setupLock)
            {
             
                return Ok("database created");
            }
        }


        [HttpGet("students")]
        public async Task<IActionResult> GetStudents()
        {
            try
            {
                await parallelism.WaitAsync();
                

                return Ok(await dbcontex.Students.Find(new BsonDocument()).ToListAsync()) ;
                
            }
            finally
            {
                parallelism.Release();
            }
        }

        [HttpGet("student")]
        public async Task<IActionResult> GetStudent([FromQuery]int id)
        {
            
            return Ok(await dbcontex.Students.Find(x=>x.Id==id).ToListAsync());
            }
        

        [HttpPut("students")]
        public async Task<IActionResult> CreateStudent([FromBody]Student student)
        {
            var students = await dbcontex.Students.Find(new BsonDocument()).ToListAsync();
            if (students.Count() == 0)
                student.Id = 1;
            else
                student.Id = students.Last().Id + 1;
            await dbcontex.Students.InsertOneAsync(student);

                return Ok();
            
        }

        [HttpPost("students")]
        public async Task<IActionResult> UpdateStudent([FromBody]Student student)
        {
        
            var query = Builders<Student>.Filter.Eq(x => x.Id, student.Id);
            await dbcontex.Students.ReplaceOneAsync(query, student);
                return Ok();
            
        }

        [HttpPost("students/{id}/career")]
        public async Task<IActionResult> UpdateStudentCareer([FromRoute] int id, [FromBody]Career Career)
        {
            var query = Builders<Student>.Filter.Eq("Id", id);
            var update = Builders<Student>.Update.Set("Career", Career);
     
            await dbcontex.Students.FindOneAndUpdateAsync<Student>(query, update);
            return Ok();
        }
        
        [HttpGet("students/{id}/career")]
        public async Task<IActionResult> GetStudentCareer([FromRoute] int id)
        {
            var filter = Builders<Student>.Filter.Eq("Id", id);
            var studente = await dbcontex.Students.Find(filter).FirstAsync();
            return Ok(studente.Career );
        }
        [HttpDelete("students")]
        public async Task<IActionResult> DeleteStudent([FromQuery]int id)
        {
            await dbcontex.Students.DeleteOneAsync(Builders<Student>.Filter.Eq("Id", id));
                return Ok();


            
        }

    }
}
