using System;
using System.Collections.Generic;
using System.Text;

namespace ServiceAPI.Dal
{
   public class Career
    {   public int Id { get; set; }
        public String Name { get; set; }
        public int Credit { get; set; }
        public ICollection<Course> Courses { get; set; }
        
    }


}
