import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import axios from 'axios';
import { userOut } from "../firebase/firebase-auth";
import {
  Box,
  Button,
  Card,
  CardMedia,
  CardContent,
  Container,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Modal,
  Select,
  Typography,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import "../../style.css";

const TMDB_BEARER_TOKEN = process.env.REACT_APP_TMDB_BEARER_TOKEN;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

const genreFilters = {
  adultos: [18, 27, 53, 80, 10752, 9648], // Drama, Terror, Suspenso, Crimen, Bélico, Misterio
  adolescentes: [28, 12, 878, 14, 16], // Acción, Aventura, Ciencia ficción, Fantasía, Animación
  infancias: [16, 10751, 35], // Animación, Familia, Comedia
  "toda-la-familia": [10751, 35, 16, 14], // Familia, Comedia, Animación, Fantasía
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '800px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
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
  const [expandedMovieId, setExpandedMovieId] = useState(null);
  // const [selectedMovie, setSelectedMovie] = useState(null); // Película seleccionada para el modal
  const [trailerKey, setTrailerKey] = useState(null); // Clave del trailer para YouTube
  const [openModal, setOpenModal] = useState(false); // Controla la visibilidad del modal


  const navigate = useNavigate(); // Hook para redirecciones

  const logout = () => {
    userOut();
    navigate('/login');
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

  const fetchTrailerFromTMDb = async (movieId) => {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {
        headers: {
          Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
        },
        params: {
          language: 'es-ES',
        },
      });
  
      // Buscar diferentes tipos de videos en orden de prioridad
      const videoTypes = ['Trailer', 'Teaser', 'Clip', 'Featurette'];
      const video = response.data.results.find(
        (video) => video.site === 'YouTube' && videoTypes.includes(video.type)
      );
  
      return video ? video.key : null; // Devuelve la clave del video o null si no hay videos
    } catch (err) {
      console.error('Error fetching trailer from TMDb:', err);
      return null; // Si falla, devuelve null
    }
  };

  const fetchTrailerFromYouTube = async (movieTitle) => {
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          part: 'snippet',
          q: `${movieTitle} trailer`,
          type: 'video',
          maxResults: 1,
          key: YOUTUBE_API_KEY,  // Usa la clave de API correcta aquí
        },
      });
  
      if (response.data.items.length > 0) {
        const videoId = response.data.items[0].id.videoId;
        setTrailerKey(videoId);  // Actualizamos el trailerKey
      } else {
        console.log('No se encontró el tráiler en YouTube.');
      }
    } catch (error) {
      console.error('Error fetching trailer from YouTube:', error);
    }
  };
  
  
  const fetchTrailer = async (movie) => {
    let trailerKey = await fetchTrailerFromTMDb(movie.id);
  
    if (!trailerKey) {
      console.log(`No se encontró tráiler en TMDb para "${movie.title}". Buscando en YouTube...`);
      trailerKey = await fetchTrailerFromYouTube(movie.title);
    }
  
    if (trailerKey) {
      console.log(`Tráiler encontrado para "${movie.title}": ${trailerKey}`);
    } else {
      console.log(`No se encontró ningún tráiler para "${movie.title}".`);
    }
  
    setTrailerKey(trailerKey);  // Asegurémonos de que el trailerKey se actualice en el estado
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

  const handleCardClick = (movieTitle) => {
    setOpenModal(true);  // Abre el modal
    setTrailerKey(null);  // Resetea el trailerKey antes de buscar
    // Intentar buscar el tráiler en YouTube
    fetchTrailerFromYouTube(movieTitle);
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

  const handleShowMore = (movieId) => {
    setExpandedMovieId(expandedMovieId === movieId ? null : movieId); // Alternar entre mostrar y ocultar
  };

  const truncateText = (text, length = 100) => {
    if (text.length > length) {
      return text.substring(0, length) + '...';
    }
    return text;
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
    <Container className="catalogBody" style={{ marginTop: '20px' }}>
      <Box className="header">
      <Typography variant="h4" component="h1" gutterBottom>
        Catálogo de Películas
      </Typography>  
      <Button
        onClick={logout}
        variant="contained"
        color="primary"
        style={{ marginBottom: '20px' }}
      >
        Salir
      </Button>
      </Box>  
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
            <Button onClick={() => handleCardClick(movie.title)}> ver trailer</Button>
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
                  {expandedMovieId === movie.id ? movie.overview : truncateText(movie.overview)}
                </Typography>
                <Button
                  onClick={() => handleShowMore(movie.id)}
                  size="small"
                  color="primary"
                >
                  {expandedMovieId === movie.id ? 'Mostrar menos' : 'Mostrar más'}
                </Button>
                <Divider sx={{ my: 2 }} />
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
      {/* Modal para el tráiler */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}  // Cierra el modal al hacer clic fuera
        aria-labelledby="trailer-modal-title"
        aria-describedby="trailer-modal-description"
      >
        <Box sx={modalStyle}>
          {trailerKey ? (
            <iframe
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${trailerKey}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <Typography variant="h6">
              Cargando tráiler...
            </Typography>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default Catalog;