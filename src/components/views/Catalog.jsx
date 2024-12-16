import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { userOut } from "../firebase/firebase-auth";
import {
  Button,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Grid,
  Container,
  CircularProgress,
} from '@mui/material';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BEARER_TOKEN = process.env.REACT_APP_TMDB_BEARER_TOKEN;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const Catalog = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = () => {
    userOut();
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Realizar solicitud a la API
        const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
          headers: {
            Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
          },
          params: {
            language: 'es-ES',
          },
        });

        // Validar respuesta
        if (response.status === 200 && response.data.results) {
          setMovies(response.data.results.filter(movie => movie.overview)); // Filtrar películas sin descripción
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

    fetchMovies();
  }, []);

  if (loading) {
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
      <Button onClick={logout} variant="contained" color="primary" style={{ marginBottom: '20px' }}>
        Salir
      </Button>
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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Catalog;