require("dotenv").config();

const watchlist = [];

const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

function formatMovieData(movie) {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    release_date: movie.release_date,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
  };
}

// Route d'accueil
app.get("/", (req, res) => {
  res.send("Bienvenue sur l'API de films");
});

// Recherche de films
app.get("/movies/search", async (req, res) => {
  const query = req.query.query;

  // Vérification de la recherche
  if (!query) {
    return res.status(400).json({
      error: "Renseignez le nom d'un film.",
    });
  }

  try {
    const apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}`;

    const response = await fetch(apiUrl);

    // Vérification de la réponse TMDB
    if (!response.ok) {
      throw new Error(`Erreur TMDB : ${response.status}`);
    }

    const data = await response.json();
    const movies = data.results.map(formatMovieData);

    return res.json(movies);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Une erreur est survenue lors de la recherche de films.",
    });
  }
});

app.get("/movies/:id", async (req, res) => {
  const movieId = req.params.id;
  const apiUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`;
  const result = await fetch(apiUrl);

  if (!result.ok) {
    return res.status(404).json({
      error: "Film non trouvé.",
    });
  }

  const data = await result.json();
  const movieData = formatMovieData(data);
  return res.json(movieData);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post("/watchlist", async (req, res) => {
  const { title } = req.body;
  const apiUrl =`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(title)}`;

  try {
    if (!title) {
      return res.status(400).json({
        error: "Renseignez le nom d'un film.",
      });
    }
    const response = await fetch(apiUrl);
    const data = await response.json();
    const movie = data.results.find((movie) => movie.title.toLowerCase() === title.toLowerCase());
    if (!movie) {
      return res.status(404).json({
        error: "Film non trouvé.",
      });
    }
    watchlist.push(title);
    res.status(201).json({message: "Film ajouté a la watchlist",watchlist});
  }catch (error) {
    console.error(error);
    res.status(500).json({error: "Une erreur est survenue lors de l'ajout du film à la watchlist."});
  }
});