﻿using Business.Abstract;
using Entities.Concrete;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class ParselController : ControllerBase
    {
        private IParselService _parselService;

        public ParselController(IParselService parselService)
        {
            _parselService = parselService;
        }

        [HttpGet("getall")]
        public IActionResult GetList()
        {
            var result = _parselService.GetList();

            if (result.Success) { return Ok(result.Data); }

            return BadRequest(result.Message);
        }

        [HttpGet("getbyid")]
        public IActionResult GetById(int parselId)
        {
            var result = _parselService.GetById(parselId);

            if (result.Success) { return Ok(result.Data); }

            return BadRequest(result.Message);
        }

        [HttpPost("add")]
        public IActionResult Add(Parsel parsel)
        {
            var result = _parselService.Add(parsel);

            if (result.Success) { return Ok(result.Message); }

            return BadRequest(result.Message);
        }

        [HttpPut("{id:int}/update")]
        public IActionResult Update(Parsel parsel)
        {
            var result = _parselService.Update(parsel);

            if (result.Success) { return Ok(result.Message); }

            return BadRequest(result.Message);
        }

        [HttpDelete("delete")]
        public IActionResult Delete(Parsel parsel)
        {
            var result = _parselService.Delete(parsel);

            if (result.Success) { return Ok(result.Message); }

            return BadRequest(result.Message);
        }
    }
}
