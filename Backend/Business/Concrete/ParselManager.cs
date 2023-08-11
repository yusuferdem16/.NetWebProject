using Business.Abstract;
using Business.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class ParselManager : IParselService
    {
        private IParselDal _parselDal;

        public ParselManager(IParselDal parselDal)
        {
            _parselDal = parselDal;
        }

        public IDataResult<Parsel> GetById(int parselId)
        {
            return new SuccessDataResult<Parsel>(_parselDal.Get(p => p.ParselId == parselId));
        }

        public IDataResult<List<Parsel>> GetList()
        {
            return new SuccessDataResult<List<Parsel>>(_parselDal.GetList().ToList());
        }

        public IResult Add(Parsel parsel)
        {
            _parselDal.Add(parsel);
            return new SuccessResult(Messages.ProductAdded);
        }

        public IResult Delete(Parsel parsel)
        {
            _parselDal.Delete(parsel);
            return new SuccessResult(Messages.ProductDeleted);
        }

        public IResult Update(Parsel parsel)
        {
            _parselDal.Update(parsel);
            return new SuccessResult(Messages.ProductUpdated);
        }

    }
}
