exports.config = function(){
  var nearestNeighbors = 5;
  var className = 'movie';
  var numOfRecommendationsToStore = 30;
  var sampleContent = true;
  var factorLeastSimilarLeastLiked = false;

  return {
    nearestNeighbors: nearestNeighbors,
    className: className,
    numOfRecsStore: numOfRecommendationsToStore,
    sampleContent: sampleContent,
    factorLeastSimilarLeastLiked: factorLeastSimilarLeastLiked
  };
};