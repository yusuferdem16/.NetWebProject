using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Utilities.Results
{
    public class ErorrResult : Result
    {
        public ErorrResult(string message) : base(false, message)
        {
        }
        public ErorrResult() : base(false)
        {
        }
    }
}
