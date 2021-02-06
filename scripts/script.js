$(document).ready(function () {
  renderRecentSearchBtns(retrieveRecentSearches()); // if searches have been made previously, they are loaded with the page

  $(document).foundation();

  $("#add-movie").on("click", function (event) {
    // when text is submitted in search form
    event.preventDefault();
    var movie = storeRecentSearches(retrieveRecentSearches()); // new search is stored
    renderRecentSearchBtns(retrieveRecentSearches()); // search history is loaded with new search
    getMovieDetails(movie);
  });

  $(document).on("click", ".recent-search", getMovieClicked); // when movie in search history is clicked

  function getMovieClicked() {
    getMovieDetails($(this).attr("alt")); // movie details are shown for clicked movie
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
      return []; // return empty array if no previous searches have been made
    }
    return storedSearches;
  }

  function renderRecentSearchBtns(recentSearches) {
    $("#recent-search-btns").empty();
    for (var i = 0; i < 3; i++) {
      if (recentSearches[i] === undefined) {
        return;
      }
      var queryURL =
        "https://www.omdbapi.com/?t=" + recentSearches[i] + "&apikey=trilogy";

      $.ajax({
        url: queryURL,
        method: "GET",
      }).then(function (response) {
        var newImg = $("<img>");
        var newDiv = $("<div>");

        newDiv.addClass("column is-flex is-justify-content-center");
        newImg.addClass("thumbnail recent-search");
        newImg.attr({ src: response.Poster, alt: response.Title });

        $("#recent-search-btns").append(newDiv);
        newDiv.append(newImg);
      });
    }
  }

  function getMovieDetails(movie) {
    $(".tabs").css("display", "");
    $("#tabsContent").css("display", "");
    $("#recent-search-btns").css("display", "");
    var queryURL =
      "https://www.omdbapi.com/?t=" + movie + "&plot=full&apikey=trilogy";
    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (omdbResponse) {
      $(".hero").css("display", "none");
      renderMainMovie(omdbResponse, movie);
      renderActorsTab(omdbResponse);
      renderCrewTab(omdbResponse);
      renderSimilarMoviesTab(movie);
    });
  }

  function renderMainMovie(omdbResponse, movie) {
    $("#body-container").css("display", "block");

    $("#main-film-poster").attr("src", omdbResponse.Poster);
    $("#main-film-name").text(
      omdbResponse.Title + " (" + omdbResponse.Year + ")"
    );
    $("#main-film-synopsis").text(omdbResponse.Plot);

    nyTimes(movie);
  }

  function renderActorsTab(omdbResponse) {
    $("#actorsTab").empty();
    $(".reveal-overlay").empty(); // Remove modals content

    var actorArray = omdbResponse.Actors.split(","); // Converting actor string into array

    for (var i = 0; i < actorArray.length; i++) {
      // Create actor images and related information
      var actorName = actorArray[i].trim();
      fetchActorImg(actorName, i);
      fetchActorInfo(actorName, i);
    }
  }

  function fetchActorImg(name, i) {
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
    $.ajax(imdbIdUrl).done(function (imdbResponse) {
      setActorImg(imdbResponse, i);

      $(document).foundation();
    });
  }

  function setActorImg(imdbResponse, i) {
    var newImg = $("<img>");

    newImg.addClass("thumbnail");

    newImg.attr({
      id: "actorImg" + i,
      src: imdbResponse.names[0].image,
      alt: imdbResponse.names[0].title,
      "data-tooltip": "",
      tabindex: "2",
      title: imdbResponse.names[0].title,
    });

    $("#actorsTab").append(newImg);

    $(document).foundation();
  }

  function fetchActorInfo(name, i) {
    var apiKey = "OXs37W7S5QcenGqKB1COIMhZ7KybW7p6exHAYP7H";
    var queryURL =
      "https://api.celebrityninjas.com/v1/search?limit=1&name=" + name;
    $.ajax({
      method: "GET",
      url: queryURL,
      headers: { "X-Api-Key": apiKey },
      contentType: "application/json",
      success: function (celebNinjasResponse) {
        actorsModals(celebNinjasResponse, name, i);

        $(document).foundation();
      },
      error: function ajaxError(jqXHR) {
        console.error("Error: ", jqXHR.celebNinjasResponseText);
      },
    });
  }

  function actorsModals(celebNinjasResponse, name, i) {
    var age = celebNinjasResponse[0].age;
    var birthday = celebNinjasResponse[0].birthday;
    var nationality = celebNinjasResponse[0].nationality;
    var occupation = celebNinjasResponse[0].occupation;

    // Creating modals when actors images are clicked
    modalDiv = $("<div>");
    modalDiv.addClass("tab-one small reveal");
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

  function renderCrewTab(omdbResponse) {
    $("#crewTab").empty();
    $(".reveal-overlay").empty();

    var directorArray = omdbResponse.Director.split(",");

    for (var i = 0; i < directorArray.length; i++) {
      var directorName = directorArray[i].trim();
      fetchDirectorImg(directorName, i);
      fetchDirectorInfo(directorName, i);
    }
  }

  function fetchDirectorImg(name, i) {
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
    $.ajax(imdbIdUrl).done(function (imdbResponse) {
      setDirectorImg(imdbResponse, i);

      $(document).foundation();
    });
  }

  function setDirectorImg(imdbResponse, i) {
    var newImg = $("<img>");

    newImg.addClass("thumbnail");
    newImg.attr({
      id: "directorImg" + i,
      src: imdbResponse.names[0].image,
      alt: imdbResponse.names[0].title,
      "data-tooltip": "",
      tabindex: "2",
      title: imdbResponse.names[0].title,
    });

    $("#crewTab").append(newImg);

    $(document).foundation();
  }

  function fetchDirectorInfo(name, i) {
    var apiKey = "OXs37W7S5QcenGqKB1COIMhZ7KybW7p6exHAYP7H";
    var queryURL =
      "https://api.celebrityninjas.com/v1/search?limit=1&name=" + name;
    $.ajax({
      method: "GET",
      url: queryURL,
      headers: { "X-Api-Key": apiKey },
      contentType: "application/json",
      success: function (celebNinjasResponse) {
        directorModals(celebNinjasResponse, name, i);

        $(document).foundation();
      },
      error: function ajaxError(jqXHR) {
        console.error("Error: ", jqXHR.responseText);
      },
    });
  }

  function directorModals(celebNinjasResponse, name, i) {
    var age = celebNinjasResponse[0].age;
    var birthday = celebNinjasResponse[0].birthday;
    var nationality = celebNinjasResponse[0].nationality;
    var occupation = celebNinjasResponse[0].occupation;

    modalDiv = $("<div>");
    modalDiv.addClass("tab-two small reveal");
    modalDiv.attr({ "data-reveal": "", id: "directorInfo0" + i });
    $("#directorImg" + i).attr("data-open", "directorInfo0" + i);
    modalDiv.append("<h2 id=directorName></h2>");
    modalDiv.append("<div id=directorInfo></div>");
    modalDiv.append(
      "<button class=close-button data-close aria-label=Close modal type=button><span aria-hidden=true>&times;</span></button>"
    );
    $("#crewTab").append(modalDiv);
    $("#directorName").text(name);
    $("directorName").addClass("modal-title");
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

  function renderSimilarMoviesTab(movie) {
    $("#filmsTab").empty();

    $.ajax({
      type: "GET",
      url: "https://tastedive.com/api/similar?limit=4",
      jsonp: "callback",
      dataType: "jsonp",
      data: {
        type: "movie",
        q: movie,
        k: "400900-Popcornp-N9NY6GRY",
      },

      success: function (tasteDiveResponse) {
        for (var i = 0; i < 4; i++) {
          fetchPosters(tasteDiveResponse, i);
        }
      },
    });
  }

  function fetchPosters(tasteDiveResponse, i) {
    const index = i;

    var queryURL =
      "https://www.omdbapi.com/?t=" +
      tasteDiveResponse.Similar.Results[i].Name +
      "&apikey=trilogy";
    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (omdbResponse) {
      displayPosters(omdbResponse, index);
      displaySimilarMoviesInfo(omdbResponse, index);
    });
  }

  function displayPosters(omdbResponse, i) {
    $(document).foundation();

    var newImg = $("<img>");

    newImg.addClass("thumbnail SuggestedFilmImg");
    newImg.attr({
      src: omdbResponse.Poster,
      alt: omdbResponse.Title,
      "data-tooltip": "",
      tabindex: "2",
      title: omdbResponse.Title,
      id: "movieImg" + i,
    });
    $("#filmsTab").append(newImg);
  }

  function displaySimilarMoviesInfo(omdbResponse, i) {
    var movieObject = {
      title: omdbResponse.Title,
      plot: omdbResponse.Plot,
      rating: omdbResponse.Rated,
      year: omdbResponse.Year,
    };

    similarMoviesModals(movieObject, i);
  }

  function similarMoviesModals(obj, i) {
    modalDiv = $("<div>");
    modalDiv.addClass("tab-three small reveal");
    modalDiv.attr({ "data-reveal": "", id: "movieInfo0" + i });
    $("#movieImg" + i).attr("data-open", "movieInfo0" + i);
    modalDiv.append("<h2 id=movieName></h2>");
    modalDiv.append("<div id=movieInfo></div>");
    modalDiv.append(
      "<button class=close-button data-close aria-label=Close modal type=button><span aria-hidden=true>&times;</span></button>"
    );

    $("#filmsTab").append(modalDiv);
    $("#movieName").text(obj.title);
    $("#movieInfo").html(
      "<b>Year: </b>" +
        obj.year +
        "<br>" +
        "<b>Rating : <b/>" +
        obj.rating +
        "<br>" +
        "<b>Plot : </b>" +
        obj.plot
    );
  }

  function nyTimes(movie) {
    var url = "https://api.nytimes.com/svc/movies/v2/reviews/search.json";
    url +=
      "?" +
      $.param({
        "api-key": "yZy7D7qdolnKnRDtSuRYxUWeYDF1hyVr",
        query: movie,
      });
    $.ajax({
      url: url,
      method: "GET",
    })
      .done(function (nyTimesResponse) {
        $("#film-review").text(nyTimesResponse.results[0].summary_short);
        $("#critic-name").text("~ " + nyTimesResponse.results[0].byline);
      })
      .fail(function (err) {
        throw err;
      });
  }

  function openTab(evt, tabName) {
    var i, x, tablinks;
    x = $(".content-tab");
    for (i = 0; i < x.length; i++) {
      x[i].style.display = "none ";
    }
    tablinks = $(".tab");
    for (i = 0; i < x.length; i++) {
      tablinks[i].className = tablinks[i].className.replace("is-active", "");
    }
    document.getElementById(tabName).style = "";
    evt.currentTarget.className += " is-active";
  }
});
