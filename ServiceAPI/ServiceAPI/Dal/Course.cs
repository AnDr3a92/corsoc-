using System;
using System.Collections.Generic;
using System.Text;

namespace ServiceAPI.Dal
{
   public class Course
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int semester { get; set; }
        public int hours { get; set; }
        public int credit { get; set; }
        public string owner { get; set; }
    }
}
