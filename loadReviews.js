//http://api.kinopoisk.cf/getReviews?filmID=326&page=27
//http://api.kinopoisk.cf/getReviews?filmID=93377&page=27
// http://api.kinopoisk.cf/searchFilms?keyword=marvel
// http://api.kinopoisk.cf/searchFilms
// http://api.kinopoisk.cf/getReviews?filmID=93377&status=bad
// getFirstReviewsPageOnFilm(93377);
// 361

'use strict';

var request = require('request'),
   async = require('async'),
   fs = require('fs'),
   getReviewsURL = 'http://api.kinopoisk.cf/getReviews?filmID=',
   badParam = '&status=bad',
   goodParam = '&status=good',
   getSimilarURL = 'http://api.kinopoisk.cf/getSimilar?filmID=',
   getReviewDetail = 'http://api.kinopoisk.cf/getReviewDetail?reviewID='
   filmStek = [],
   pageParam = '&page=',
   fileName = 'data.json'

/*
* Парсит комментарии к фильмам, похожим на заданный.
* @param {String, Number} id - идентификатор фильма.
*
*/
function parseFilmStek(id){
   // Просим передать список похожих фильмов по нашему фильму
   request(getSimilarURL + id, function (error, response, body) {
      if (!error && response.statusCode == 200) {
         // Объект с результатами
         var responseObj = JSON.parse(body);

         // Если по данному фильму есть похожие фильмы, то стянем их
         if(typeof responseObj.items !== 'undefined'){
            var items = responseObj.items[0];
            // Пушим в массив id первоначального фильма
            items.push({id: id})
            console.log('Всего фильмов ' + items.length)

            var stekTask = items.map(function(item, index){
               return getReviewsIdOnFilm.bind(null, item.id)
            })

            async.series(stekTask, function (err, results) {
               var shortResult = JSON.stringify(results);
               writeResult(fileName, shortResult);
               // loadFullReviews(simpleArray, writeResult);
            });
         }
      }
   });
}

// parseFilmStek(46066)

function generateDataset(data){
   // массив положительных и отрицательных наборов
   var simpleArrays = data.reduce(function (simpleArray, item) {
      simpleArray[0].concat(item[0]);
      simpleArray[1].concat(item[1]);
      return simpleArray
   }, [[],[]])

   var goodReviewsStekTask = simpleArrays[0].map(function (item, index) {
      return getReview.bind(null, item.id)
   })

   var badReviewsStekTask = = simpleArrays[0].map(function (item, index) {
      return getReview.bind(null, item.id)
   })
   
   var stekTask = items.map(function(item, index){
      return getReviewsIdOnFilm.bind(null, item.id)
   })
}

/*
* Функция, собирающая одинаковое количество положительных и отрицательных отзывов по фильму.
* @param {String, Number} filmId - идентификатор фильма.
* @param {Function} onFinish - callback.
*  В процессе работы вызывает onFinish, в которую передает объект:
*  {Object} - объект с положительными и отрицательными массивами комментариев. Формат:
*     {Array} - good
*     {Array} - bad
* @return
*/
function getReviewsIdOnFilm(filmId, onFinish){
   var filmUrl = getReviewsURL + filmId;
   request(filmUrl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
         var reviewsList = JSON.parse(body);
         // Если по данному фильму есть отзывы, то стянем все отзывы
         if(typeof reviewsList.reviews !== 'undefined'){
            var goodReviewsCount = +reviewsList.reviewPositiveCount,
               badReviewsCount = +reviewsList.reviewNegativeCount,
               positiveUrl = filmUrl + goodParam,
               negativeUrl = filmUrl + badParam,
               reviewsCount = goodReviewsCount > badReviewsCount ? badReviewsCount: goodReviewsCount,
               stekTask = [
                  getPartReviewsIdOnUrl.bind(null, positiveUrl, 1, reviewsCount, new Array),
                  getPartReviewsIdOnUrl.bind(null, negativeUrl, 1, reviewsCount, new Array)
               ],
               reviewsOnFilm = [];
            async.series(stekTask, function (err, results) {onFinish(null, results)});
         }
      }
   });
}

/*
* Функция, собирающая count отзывов по url адресу.
* @param {String} initUrl - адрес.
* @param {Nubmer} page - номер страницы.
* @param {Nubmer} count - количество отзывов, которые должны быть извлечены.
* @param {Array} currentSet - текущий набор отзывов.
* @param {Function} onFinish - callback.
*  В процессе работы вызывает onFinish, в которую передает массив:
*  {Array} - отзывы.
* @return
*/
function getPartReviewsIdOnUrl(initUrl, page, count, currentSet, onFinish) {
   var url = initUrl + pageParam + page;
   request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
         var reviewsList = JSON.parse(body),
            reviews = reviewsList.reviews;

         if(typeof reviewsList.reviews !== 'undefined'){
            console.log(reviewsList.reviews);
            console.log(currentSet);
            currentSet = currentSet.concat(reviews);
            if (currentSet.length < count) {
               getPartReviewsIdOnUrl(initUrl, page+1, count, currentSet, onFinish)
            } else {
               currentSet.length = count;
               onFinish(null, currentSet)
            }
         }
         else {
            onFinish(null, currentSet)
         }
      }
   });
}


function writeResult (fileName, data){
   fs.writeFile(fileName, data, function(err){
      if (err) throw err;
      console.log('It\'s saved!');
   });
}
