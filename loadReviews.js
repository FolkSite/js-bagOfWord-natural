//http://api.kinopoisk.cf/getReviews?filmID=326&page=27
//http://api.kinopoisk.cf/getReviews?filmID=93377&page=27
// http://api.kinopoisk.cf/searchFilms?keyword=marvel
// http://api.kinopoisk.cf/getReviews?filmID=93377&status=bad
// http://api.kinopoisk.cf/getReviewDetail?reviewID=
// getFirstReviewsPageOnFilm(93377);
// 361

'use strict';

var request = require('request'),
   async = require('async'),
   fs = require('fs'),
   getReviewsURL = 'http://api.kinopoisk.cf/getReviews?filmID=',
   getReviewURL = 'http://api.kinopoisk.cf/getReviewDetail?reviewID=',
   badParam = '&status=bad',
   goodParam = '&status=good',
   getSimilarURL = 'http://api.kinopoisk.cf/getSimilar?filmID=',
   filmStack = [],
   pageParam = '&page=',
   intermediateFileName = 'intermediate.json',
   fileName = 'result.json';


/*
* Парсит комментарии к фильмам, похожим на заданный.
* @param {String, Number} id - идентификатор фильма.
*
*/
function parseFilmStack(id){
   // Просим передать список похожих фильмов по нашему фильму
   request(getSimilarURL + id, function (error, response, body) {
      if (!error && response.statusCode == 200) {
         // Объект с результатами
         var responseObj = JSON.parse(body);

         // Если по данному фильму есть похожие фильмы, то стянем их
         if(typeof responseObj.items !== 'undefined'){
            var items = responseObj.items[0];
            // Пушим в массив id первоначального фильма
            items.push({id: id});
            console.log('Всего фильмов ' + items.length);

            var stekTask = items.map(function(item, index){
               return getReviewsIdOnFilm.bind(null, item.id)
            });

            //TODO: закомментировать!
            async.series(stekTask, function (err, results) {
               //Клонируем результат в отдельный объект
               var writeData = JSON.parse(JSON.stringify(results));

               // Дополняет массив результатов данными о фильме
               writeData = writeData.map(function(item, index){
                  return {id: items[index].id, data: item}
               });

               writeData = JSON.stringify(writeData);
               writeResult(intermediateFileName, writeData);

               //generateDataset(results)
            });
         }
      }
   });
}

// parseFilmStack(46066)

function generateDataset(data){
   // массив положительных и отрицательных наборов
   var result = [],
      simpleArrays = data.reduce(function (intermediate, item) {
         intermediate[0] = intermediate[0].concat(item[0]);
         intermediate[1] = intermediate[1].concat(item[1]);
         return intermediate
      }, [[],[]]),
      //goodReviewsStackTask = [getReview.bind(null, simpleArrays[0][0].id)],
      //
      //badReviewsStackTask = [getReview.bind(null, simpleArrays[1][0].id)];
      goodReviewsStackTask = simpleArrays[0].map(function (item, index) {
         return getReview.bind(null, item.reviewID);
      }),
      badReviewsStackTask = simpleArrays[1].map(function (item, index) {
         return getReview.bind(null, item.reviewID);
      });
   //console.log(simpleArrays[0][0]);
   async.series(goodReviewsStackTask, function (err, results) {
      result.push(results);

      async.series(badReviewsStackTask, function (err, results) {
         result.push(results);
         result = JSON.stringify(result);
         writeResult(fileName, result);
      });
   });
}


function getReview(id, callback){
   var reviewUrl = getReviewURL + id;
   request(reviewUrl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
         var review = JSON.parse(body);
         console.log('status: 200');
         callback(null, review)
      }
   });
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


/*
 * Пишет необходимые данные в файл.
 * @param {String} fileName - имя файла.
 * @param {String} data - тело файла.
 *
 * @return
 */
function writeResult (fileName, data){
   fs.writeFile(fileName, data, function(err){
      if (err) throw err;
      console.log('It\'s saved!');
   });
}

function getRewiewsCountInFile (fileName){
   fs.readFile(fileName, 'utf8', function (err, data) {
      if (err) {
         return console.log(err);
      }
      var data = JSON.parse(data);
      console.log(data.reduce(function(sum, current) {
         return sum + current[0].length;
      }, 0))
   });
}
//getRewiewsCountInFile('data.json');

function downloadFromTheIntermediateFile (fileName){
   fs.readFile(fileName, 'utf8', function (err, data) {
      if (err) {
         return console.log(err);
      }
      var data = JSON.parse(data);
      generateDataset(data)
   });
}

downloadFromTheIntermediateFile('361.json');