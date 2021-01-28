$(document).ready(function () {
  renderRecentSearchBtns(retrieveRecentSearches());

  $("#add-movie").on("click", function (event) {
    event.preventDefault();

    var movie = storeRecentSearches(retrieveRecentSearches());

    renderRecentSearchBtns(retrieveRecentSearches());

    getMovieDetails(movie);
  });

  $(document).on("click", ".recent-search", getMovieClicked);

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

  function getMovieClicked() {
    getMovieDetails($(this).attr("movie-name"));
  }

  function getMovieDetails(movie) {
    var queryURL = "https://www.omdbapi.com/?t=" + movie + "&apikey=trilogy";

    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      console.log(response);

      $("#main-film-poster").attr("src", response.Poster);
      $("#main-film-name").text(response.Title + " (" + response.Year + ")");
      $("#main-film-synopsis").text(response.Plot);
    });
  }
});
