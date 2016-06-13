$(document).ready(function() {
  var token = window.location.hash;
  if (!token) {
    window.location.replace("./login.html");
  }
  token = token.replace("#", "?"); // Ready for query param.
  getInstaPics(token);
});

function getInstaPics(token) {
  var INSTA_API_BASE_URL = "https://api.instagram.com/v1";
  var path = "/users/self/media/recent";
  var mediaUrl = INSTA_API_BASE_URL + path + token;
  $.ajax({
    method: "GET",
    url: mediaUrl,
    dataType: "jsonp",
    success: function(response) {
      showPictures(response.data);
      analyzeSentiments(response.data);
    }
  });
}

function showPictures(data) {
  $("#list").html("");
  for (var i=0; i<data.length; i++) {
    var picData = data[i];
    var postDiv = $("<div></div>");
    postDiv.addClass("post");
    // Mark this as this with this ID so we can find it for sentiment analysis.
    postDiv.attr("id", "post-" + i); 
    var img = $("<img />")
    img.attr("src", picData.images.standard_resolution.url);
    var caption = $("<p></p>");
    caption.addClass("caption");
    caption.html(picData.caption.text);
    postDiv.append(img).append(caption);
    $("#list").append(postDiv);
  }
}

function analyzeSentiments(data) {
  $.each(data, function(index, value) {
    var phrase = value.caption.text;
    var SENTIMENT_API_BASE_URL =
      "https://twinword-sentiment-analysis.p.mashape.com/analyze/";
    $.ajax({
      method: "POST",
      url: SENTIMENT_API_BASE_URL,
      headers: {
        "X-Mashape-Key": "H0IoG8ybyymshvm2IlQmwZk8Vlqlp1KD3F2jsn2RLpghqszsGI"
      },
      data: {text: phrase},
      success: function(response) {
        console.log(response);
        addSentiment(response.type, response.score, index);
      }
    });
  });
}

function addSentiment(type, score, picNum) {
  // Find the post the corresponds to this sentiment
  var picDiv = $("#post-" + picNum);
  // Create a sentiment div
  var sentimentDiv = $("<div></div>");
  var sentimentI = $("<i></i>");
  sentimentI.addClass("fa");
  // Add the appropriate smiley using FontAwesome
  var faClass = "fa-meh-o";
  if (type === "positive") {
    sentimentDiv.addClass("positive");
    faClass = "fa-smile-o";
  } else if (type === "negative") {
    sentimentDiv.addClass("negative");
    faClass = "fa-frown-o";
  }
  sentimentI.addClass(faClass);

  sentimentDiv.append("Sentiment: ").append(sentimentI)
    .append(" (score: " + score.toFixed(2) + ")");
  picDiv.append(sentimentDiv);
  
  updateTotalSentiment(score);
}

var allSentimentScores = []; // Aggregator for all sentiments so far.
function updateTotalSentiment(score) {
  allSentimentScores.push(score);
  console.log(allSentimentScores, score);
  // Calculate the average sentiment.
  var sum = 0;
  for (var i=0; i<allSentimentScores.length; i++) {
    sum += allSentimentScores[i];
  }
  var avg = sum / allSentimentScores.length;

  // Add nice text and colors.
  var text = "Neutral"
  var textClass = "";
  if (avg > 0) {
    text = "Positive!";
    textClass = "positive";
  } else if (avg < 0) {
    text = "Negative :(";
    textClass = "negative";
  }

  $("#mood").html(text + " (score: " + avg + ")");
  $("#mood").addClass(textClass);
}







