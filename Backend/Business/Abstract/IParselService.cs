using Core.Utilities.Results;
using Entities.Concrete;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IParselService
    {
        IDataResult<Parsel> GetById(int parselId);
        IDataResult<List<Parsel>> GetList();
        IResult Add(Parsel parsel);
        IResult Delete(Parsel parsel);
        IResult Update(Parsel parsel);
    }
}
