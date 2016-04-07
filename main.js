//http://api.kinopoisk.cf/getReviews?filmID=326&page=27

var request = require('request'),
   fs = require('fs'),
   url = 'http://api.kinopoisk.cf/getReviews?filmID=',
   pageParams = '&page=',
   reviews = [];
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
            var reviewAllCount = firstResponseObject.reviewAllCount;
            reviews.concat(firstResponseObject.reviews);
            getReviewsPage(2, reviewAllCount);
         }
      }
   });
}

function getReviewsPage(pageNumber, reviewAllCount) {
   if (pageNumber <= reviewAllCount) {
      request(url + id + '&page=' + pageNumber, function (error, response, body) {
         if (!error && response.statusCode == 200) {
            console.log('ok, status 200');
            var responseObject = JSON.parse(body);
            reviews.concat(responseObject.reviews);
            getReviewsPage(pageNumber + 1, reviewAllCount)
         }
         else {
            console.log('error')
         }
      });
   } else {
      console.log('all page load')
   }
}

function writeResult (data){
   fs.writeFile('data.json', data, function(err){
      if (err) throw err;
      console.log('It\'s saved!');
   });
}