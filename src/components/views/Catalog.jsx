import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { userOut } from "../firebase/firebase-auth";
import {
  Button,
  Card,
  CardMedia,
  CardContent,
  FormControl,
  Typography,
  Grid,
  Container,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import Select from '@mui/material/Select';
import StarIcon from '@mui/icons-material/Star';

const TMDB_BEARER_TOKEN = process.env.REACT_APP_TMDB_BEARER_TOKEN;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const genreFilters = {
  adultos: [18, 27, 53, 80, 10752, 9648], // Drama, Terror, Suspenso, Crimen, Bélico, Misterio
  adolescentes: [28, 12, 878, 14, 16], // Acción, Aventura, Ciencia ficción, Fantasía, Animación
  infancias: [16, 10751, 35], // Animación, Familia, Comedia
  "toda-la-familia": [10751, 35, 16, 14], // Familia, Comedia, Animación, Fantasía
};

const Catalog = () => {
  const [movies, setMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("toda-la-familia");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const logout = () => {
    userOut();
  };

  // Obtener géneros
  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
        headers: {
          Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
        },
        params: {
          language: 'es-ES',
        },
      });
      setGenres(response.data.genres);
    } catch (err) {
      console.error('Error fetching genres:', err);
      setError('No se pudieron cargar los géneros.');
    }
  };

  // Obtener películas
  const fetchMovies = async (page) => {
    setLoading(true);
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {
        headers: {
          Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
        },
        params: {
          language: 'es-ES',
          page,
        },
      });

      if (response.status === 200 && response.data.results) {
        const filteredMovies = response.data.results.filter((movie) => movie.overview);

        setAllMovies((prevMovies) => {
          const newMovies = filteredMovies.filter(
            (newMovie) => !prevMovies.some((existingMovie) => existingMovie.id === newMovie.id)
          );
          return [...prevMovies, ...newMovies];
        });

        if (page >= response.data.total_pages) {
          setHasMore(false);
        }
      } else {
        throw new Error('Error al obtener las películas.');
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('No se pudieron cargar las películas. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
    fetchMovies(page);
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        hasMore &&
        !loading
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  // Filtrar películas según el filtro seleccionado
  useEffect(() => {
    if (filter && genreFilters[filter]) {
      const selectedGenres = genreFilters[filter];
      setMovies(allMovies.filter((movie) => movie.genre_ids.some((id) => selectedGenres.includes(id))));
    } else {
      setMovies(allMovies); // Sin filtro, muestra todas las películas
    }
  }, [filter, allMovies]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const getGenreNames = (genreIds) => {
    return genreIds
      .map((id) => {
        const genre = genres.find((genre) => genre.id === id);
        return genre ? genre.name : 'Desconocido';
      })
      .join(', ');
  };

  const renderStars = (rating) => {
    const totalStars = 5;
    const fullStars = Math.round(rating / 2);
    return Array.from({ length: totalStars }, (_, i) => (
      <StarIcon key={i} color={i < fullStars ? "primary" : "disabled"} />
    ));
  };

  if (loading && movies.length === 0) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={{ marginTop: '20px', textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: '20px' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Catálogo de Películas Populares
      </Typography>
      <Button
        onClick={logout}
        variant="contained"
        color="primary"
        style={{ marginBottom: '20px' }}
      >
        Salir
      </Button>
      <FormControl style={{ marginBottom: '20px', minWidth: 200 }}>
        <Select value={filter} onChange={handleFilterChange} displayEmpty>
          <MenuItem value="toda-la-familia">Toda la familia</MenuItem>
          <MenuItem value="infancias">Infancias</MenuItem>
          <MenuItem value="adolescentes">Adolescentes</MenuItem>
          <MenuItem value="adultos">Adultos</MenuItem>
        </Select>
      </FormControl>
      <Grid container spacing={4}>
        {movies.map((movie) => (
          <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
            <Card>
              <CardMedia
                component="img"
                height="300"
                image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
              />
              <CardContent>
                <Typography variant="h6" component="h2">
                  {movie.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {movie.overview}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Géneros: {getGenreNames(movie.genre_ids)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Calificación: {renderStars(movie.vote_average)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {loading && (
        <Container style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </Container>
      )}
    </Container>
  );
};

export default Catalog;