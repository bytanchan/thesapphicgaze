// fetchMovies.js
import axios from 'axios';

const API_KEY = '36fa28949cb6128b47c527a6ff2abd1a';
const BASE_URL = 'https://api.themoviedb.org/3';

export const fetchRandomMovies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/discover/movie`, {
      params: {
        api_key: API_KEY,
        sort_by: 'popularity.desc',
        page: Math.floor(Math.random() * 500) + 1, // Random page between 1 and 500
      },
    });

    console.log('API Response:', response); // Log the entire response

    const movies = response.data.results.slice(0, 3); // Get the first 3 movies from the results

    return movies.map(movie => ({
      title: movie.title,
      description: movie.overview,
      poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    }));
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};
