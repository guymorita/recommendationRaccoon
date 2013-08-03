exports.recommendation = function(){


  return {
    recommendationForUser: function(userList, userName, callback){
      algo.getRecommendations(userList, userName, callback);
    },

    topSimilarUsers: function(userList, userName, callback){
      algo.topSimilarUsers(userList, userName, callback);
    },

    similarity: function(userId1, userId2){
      algo.jaccardCoefficient(userId1, userId2);
    }

  };
};