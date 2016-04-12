//http://api.kinopoisk.cf/getReviews?filmID=326&page=27
//http://api.kinopoisk.cf/getReviews?filmID=93377&page=27
// http://api.kinopoisk.cf/searchFilms?keyword=marvel
// http://api.kinopoisk.cf/getReviews?filmID=93377&status=bad
// getFirstReviewsPageOnFilm(93377);
// 361

'use strict';

var request = require('request'),
   fs = require('fs'),
   getReviewsURL = 'http://api.kinopoisk.cf/getReviews?filmID=',
   badReviews = '&status=bad',
   goodReviews = '&status=good',
   getSimilarURL = 'http://api.kinopoisk.cf/getSimilar?filmID=',
   filmStek = [],
   pageParams = '&page=',
   film = {reviews: []};

/*
* Парсит комментарии к фильмам, похожим на заданный. 
*
*/
function parseFilpStek(id){
   // Просим передать список похожих фильмов по нашему фильму
   request(getSimilarURL + id, function (error, response, body) {
      if (!error && response.statusCode == 200) {
         // Объект с результатами
         var responseObj = JSON.parse(body);

         // Если по данному фильму есть похожие фильмы, то стянем их
         if(typeof responseObj.items !== 'undefined'){
            var items = responseObj.items[0],
               reviews = {good: [], bad: []}
            filmStek = items.reduce(function (item) {
               return item.id
            })
            console.log('Похожих фильмов ' + filmStek.length)
            filmStek.push(id)
         }
      }
   });

}

parseFilpStek(361)
/*
* Функция, собирающая одинаковое количество положительных и отрицательных отзывов по фильму. 
*
*/
function getReviewsOnFilm(id){
   request(url+id, function (error, response, body) {
      if (!error && response.statusCode == 200) {
         var firstResponseObject = JSON.parse(body);
         // Если по данному фильму есть отзывы, то стянем все отзывы
         if(typeof firstResponseObject.reviews !== 'undefined'){
            var pagesCount = firstResponseObject.pagesCount;
            var reviews = film.reviews
            film.reviews = reviews.concat(firstResponseObject.reviews);
            film.id = firstResponseObject.filmID
            film.name = name
            // writeResult()
            // getReviewsPage(id, 2, pagesCount);
         }
      }
   });
}

function getReviewsPage(id, pageNumber, pagesCount) {
   if (pageNumber <= pagesCount) {
      var url = url + id + '&page=' + pageNumber;
      request(url, function (error, response, body) {
         if (!error && response.statusCode == 200) {
            console.log('ok, status 200');
            var responseObject = JSON.parse(body);
            reviews = reviews.concat(responseObject.reviews);
            getReviewsPage(id, pageNumber + 1, pagesCount)
         }
         else {
            console.log('error')
         }
      });
   } else {
      console.log('all page load');
      writeResult();
   }
}

function writeResult (fileName, data){
   fs.writeFile(fileName, data, function(err){
      if (err) throw err;
      console.log('It\'s saved!');
   });
}
