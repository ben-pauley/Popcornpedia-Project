$(document).ready(function () {
  renderRecentSearchBtns(retrieveRecentSearches());
  $(document).foundation();
  $("#add-movie").on("click", function (event) {
    event.preventDefault();
    var movie = storeRecentSearches(retrieveRecentSearches());
    renderRecentSearchBtns(retrieveRecentSearches());
    getMovieDetails(movie);
  });
  $(document).on("click", ".recent-search", getMovieClicked);
  function getMovieClicked() {
    getMovieDetails($(this).attr("movie-name"));
  }
  function storeRecentSearches(recentSearches) {
    var movie = $("#movie-input").val().trim();
    if (movie === "") {
      return;
    }
    recentSearches.push(movie);
    if (recentSearches.length > 3) {
      recentSearches = recentSearches.slice(1);
    }
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    return movie;
  }
  function retrieveRecentSearches() {
    var storedSearches = JSON.parse(localStorage.getItem("recentSearches"));
    if (storedSearches === null) {
      return [];
    }
    return storedSearches;
  }
  function renderRecentSearchBtns(recentSearches) {
    $("#recent-search-btns").empty();
    for (var i = 0; i < 3; i++) {
      if (recentSearches[i] === undefined) {
        return;
      }
      var newButton = $("<button>");
      newButton.addClass("button secondary recent-search");
      newButton.attr("movie-name", recentSearches[i]);
      newButton.text(recentSearches[i]);
      $("#recent-search-btns").prepend(newButton);
    }
  }
  function getMovieDetails(movie) {
    var queryURL = "https://www.omdbapi.com/?t=" + movie + "&apikey=trilogy";
    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {

      renderMainMovie(response);
      $("#actorsTab").empty();
      // Converting actor string into array
      var actorArray = response.Actors.split(",");
      // Remove modals content
      $(".reveal-overlay").empty();
      // For loop that create actors images and their related infomation
      for (var i = 0; i < actorArray.length; i++) {
        var actorName = actorArray[i].trim();
        getActorImg(actorName, i);
        getCelebrityInfo(actorName, i);
      }
      renderCrewTab(response);
    });
  }
  
  function getCelebrityInfo(name, i) {
    var apiKey = "Wvx0+onLZFq2287mLWm4CA==38WLOWdjk3UqQ6FZ";
    var queryURL =
      "https://api.celebrityninjas.com/v1/search?limit=1&name=" + name;
    $.ajax({
      method: "GET",
      url: queryURL,
      headers: { "X-Api-Key": apiKey },
      contentType: "application/json",
      success: function (response) {
        // Creating variables that hold specific responses from the API
        var age = response[0].age;
        var birthday = response[0].birthday;
        var nationality = response[0].nationality;
        var occupation = response[0].occupation;
        // Calling function that holds actors Modals
        actorsModals(name, age, birthday, nationality, occupation, i);
        $(document).foundation();
      },
      error: function ajaxError(jqXHR) {
        console.error("Error: ", jqXHR.responseText);
      },
    });
  }
  function getSimilarMovies(movie) {
    $.ajax({
      type: "GET",
      url: "https://tastedive.com/api/similar?limit=10",
      jsonp: "callback",
      dataType: "jsonp",
      data: {
        type: "movie",
        q: movie,
        k: "400900-Popcornp-N9NY6GRY",
      },
      success: function (response) {
        console.log(response.Similar.Results[0]);
      },
    });
  }
  function renderMainMovie(response) {
    $("#body-container").css("display", "block");
    $("#main-film-poster").attr("src", response.Poster);
    $("#main-film-name").text(response.Title + " (" + response.Year + ")");
    $("#main-film-synopsis").text(response.Plot);
  }
  function renderCrewTab(omdbResponse) {
    var directorArray = omdbResponse.Director.split(",");
    $(".reveal-overlay").empty();
    for (var i = 0; i < directorArray.length; i++) {
      var directorName = directorArray[i].trim();
      getDirectorImg(directorName, i);
      getDirectorInfo(directorName, i);
    }
  }
  function getDirectorInfo(name, i) {
    var apiKey = "Wvx0+onLZFq2287mLWm4CA==38WLOWdjk3UqQ6FZ";
    var queryURL =
      "https://api.celebrityninjas.com/v1/search?limit=1&name=" + name;
    $.ajax({
      method: "GET",
      url: queryURL,
      headers: { "X-Api-Key": apiKey },
      contentType: "application/json",
      success: function (response) {
        // Creating variables that hold specific responses from the API
        var age = response[0].age;
        var birthday = response[0].birthday;
        var nationality = response[0].nationality;
        var occupation = response[0].occupation;
        // Calling function that holds actors Modals
        directorModals(name, age, birthday, nationality, occupation, i);
        $(document).foundation();
      },
      error: function ajaxError(jqXHR) {
        console.error("Error: ", jqXHR.responseText);
      },
    });
  }
  // get Actors images
  function getActorImg(name, i) {
    var imdbIdUrl = {
      async: true,
      crossDomain: true,
      url:
        "https://imdb-internet-movie-database-unofficial.p.rapidapi.com/search/" +
        name,
      method: "GET",
      headers: {
        "x-rapidapi-key": "f1b3cbe9c3msh648456feaa198ebp1d2da3jsnc55cec980b8a",
        "x-rapidapi-host":
          "imdb-internet-movie-database-unofficial.p.rapidapi.com",
      },
    };
    $.ajax(imdbIdUrl).done(function (imdbIdresponse) {
      // Creating images for each actor name
      var newImg = $("<img>");
      newImg.addClass("thumbnail");
      newImg.attr({
        id: "actorImg" + i,
        src: imdbIdresponse.names[0].image,
        alt: imdbIdresponse.names[0].title,
        "data-tooltip": "",
        tabindex: "2",
        title: imdbIdresponse.names[0].title,
      });
      newImg.css({ width: "150px", height: "150px" });
      $("#actorsTab").append(newImg);
      $(document).foundation();
    });
  }
  function actorsModals(name, age, birthday, nationality, occupation, i) {
    // Creating modals when actors images are clicked
    modalDiv = $("<div>");
    modalDiv.addClass("small reveal");
    modalDiv.attr({ "data-reveal": "", id: "actorInfo0" + i });
    $("#actorImg" + i).attr("data-open", "actorInfo0" + i);
    modalDiv.append("<h2 id=actorName></h2>");
    modalDiv.append("<div id=actorInfo></div>");
    modalDiv.append(
      "<button class=close-button data-close aria-label=Close modal type=button><span aria-hidden=true>&times;</span></button>"
    );
    $("#actorsTab").append(modalDiv);
    $("#actorName").text(name);
    $("#actorInfo").html(
      "<b>Age: </b>" +
        age +
        "<br>" +
        "<b>Birthday : <b/>" +
        birthday +
        "<br>" +
        "<b>Nationality : </b>" +
        nationality +
        "<br>" +
        "<b>Occupation : </b>" +
        occupation
    );
  }
  function directorModals(name, age, birthday, nationality, occupation, i) {
    modalDiv = $("<div>");
    modalDiv.addClass("small reveal");
    modalDiv.attr({ "data-reveal": "", id: "directorInfo0" + i });
    $("#directorImg" + i).attr("data-open", "directorInfo0" + i);
    modalDiv.append("<h2 id=directorName></h2>");
    modalDiv.append("<div id=directorInfo></div>");
    modalDiv.append(
      "<button class=close-button data-close aria-label=Close modal type=button><span aria-hidden=true>&times;</span></button>"
    );
    $("#crewTab").append(modalDiv);
    $("#directorName").text(name);
    $("#directorInfo").html(
      "<b>Age: </b>" +
        age +
        "<br>" +
        "<b>Birthday : <b/>" +
        birthday +
        "<br>" +
        "<b>Nationality : </b>" +
        nationality +
        "<br>" +
        "<b>Occupation : </b>" +
        occupation
    );
  }
  function getDirectorImg(name, i) {
    var imdbIdUrl = {
      async: true,
      crossDomain: true,
      url:
        "https://imdb-internet-movie-database-unofficial.p.rapidapi.com/search/" +
        name,
      method: "GET",
      headers: {
        "x-rapidapi-key": "f1b3cbe9c3msh648456feaa198ebp1d2da3jsnc55cec980b8a",
        "x-rapidapi-host":
          "imdb-internet-movie-database-unofficial.p.rapidapi.com",
      },
    };
    $.ajax(imdbIdUrl).done(function (imdbIdresponse) {
      var newImg = $("<img>");
      newImg.addClass("thumbnail");
      newImg.attr({
        id: "directorImg" + i,
        src: imdbIdresponse.names[0].image,
        alt: imdbIdresponse.names[0].title,
        "data-tooltip": "",
        tabindex: "2",
        title: imdbIdresponse.names[0].title,
      });
      newImg.css({ width: "150px", height: "150px" });
      $("#crewTab").append(newImg);
      $(document).foundation();
    });
  }
});
