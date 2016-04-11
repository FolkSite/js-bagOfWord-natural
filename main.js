//http://api.kinopoisk.cf/getReviews?filmID=326&page=27
//http://api.kinopoisk.cf/getReviews?filmID=93377&page=27

var request = require('request'),
   fs = require('fs'),
   url = 'http://api.kinopoisk.cf/getReviews?filmID=',
   pageParams = '&page=',
   reviews = [],
   id = 93377;
/*
* Функция первого запроса. 
*
*
*/
function getFirstReviewsPageOnFilm(id){
   request(url+id, function (error, response, body) {
      if (!error && response.statusCode == 200) {
         var firstResponseObject = JSON.parse(body);
         // Если по данному фильму есть отзывы, то стянем все отзывы
         if(typeof firstResponseObject.reviews !== 'undefined'){
            var pagesCount = firstResponseObject.pagesCount;
            reviews = reviews.concat(firstResponseObject.reviews);
            console.log(reviews);
            // getReviewsPage(2, pagesCount);
         }
      }
   });
}

function getReviewsPage(pageNumber, pagesCount) {
   if (pageNumber <= pagesCount) {
      request(url + id + '&page=' + pageNumber, function (error, response, body) {
         if (!error && response.statusCode == 200) {
            console.log('ok, status 200');
            var responseObject = JSON.parse(body);
            reviews = reviews.concat(responseObject.reviews);
            getReviewsPage(pageNumber + 1, pagesCount)
         }
         else {
            console.log('error')
         }
      });
   } else {
      console.log('all page load');
      writeResult(reviews);
   }
}

function writeResult (data){
   data = JSON.stringify(data);
   fs.writeFile('data.json', data, function(err){
      if (err) throw err;
      console.log('It\'s saved!');
   });
}

getFirstReviewsPageOnFilm(93377);