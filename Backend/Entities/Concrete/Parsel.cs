using Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Concrete
{
    public class Parsel : IEntity
    {
        public int ParselId { get; set; }
        public String? Sehir { get; set; }

        public String? Ilce { get; set; }

        public String? Mahalle { get; set; }

        public String? Wkt { get; set; }
    }
}
