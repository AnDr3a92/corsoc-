
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;

namespace ServiceAPI.Dal
{
    public class MongodbContex
    {
        MongoClient Client;
        public IMongoDatabase Database ;
        public IMongoCollection<Student> Students { get; set; }
        public IMongoCollection<Career> Careers { get; set; }
        public IQueryable<ICollection<Course>> Courses { get; private set; }

        public MongodbContex()
        {
            Client = new MongoClient("mongodb://127.0.0.1");
            Database = Client.GetDatabase("University");
            Students = Database.GetCollection<Student>("students");
            Careers= Database.GetCollection<Career>("careers");
            Courses = Careers.AsQueryable().Select(x => x.Courses);
        }


    }
}