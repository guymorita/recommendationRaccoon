exports.config = function(){
  var nearestNeighbors = 5;
  var className = 'movie';
  var numOfRecommendationsToStore = 30;
  var starterContent = true;

  return {
    nearestNeighbors: nearestNeighbors,
    className: className,
    numOfRecsStore: numOfRecommendationsToStore
  };
};