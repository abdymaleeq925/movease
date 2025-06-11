import React, {useState, useEffect} from 'react';
import Spinner from "./Spinner.jsx";

const MovieDetailModal = ({api:{API_BASE_URL, API_OPTIONS}, setIsModalOpen, movieId, onSelectRecommendedMovie}) => {
    const [movieDetails, setMovieDetails] = useState({});
    const [video, setVideo] = useState({});
    const [recommendedMoviesList, setRecommendedMoviesList] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const movieData = [
        {
            title: "Genre",
            value:  movieDetails?.genres?.map(g => g.name)
        },
        {
            title: "Overview",
            value:  movieDetails?.overview
        },
        {
            title: "Release date",
            value:  `${new Date(movieDetails?.release_date).toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"})}`
        },
        {
            title: "Countries",
            value: movieDetails?.production_countries?.map(c => c.name)
        },
        {
            title: "Status",
            value: movieDetails?.status
        },
        {
            title: "Spoken languages",
            value: movieDetails?.spoken_languages?.map(l => l.english_name)
        },
        {
            title: "Budget",
            value:  `$${formatNumber(movieDetails?.budget)}`
        },
        {
            title: "Revenue",
            value:  `$${formatNumber(movieDetails?.revenue)}`
        },
        {
            title: "Tagline",
            value:  movieDetails?.tagline
        },
        {
            title: "Production companies",
            value: movieDetails?.production_companies?.map(c => c.name)
        }
    ]

    function formatNumber(num) {
        if (num >= 1_000_000_000) {
            return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
        }
        if (num >= 1_000_000) {
            return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1_000) {
            return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return num;
    }

    function autoScrollUp() {
        const modal = document.querySelector('.movie-detail');
        modal?.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const fetchMovieDetails = async () => {
        setIsLoading(true);
        setErrorMessage('');
        try{
            const endpoint = `${API_BASE_URL}/movie/${movieId}`;
            const response = await fetch(endpoint, API_OPTIONS);
            if (!response.ok){
                throw new Error('Failed to fetch movie details.');
            }
            const data = await response.json();
            setMovieDetails(data || {});
            if (data === 'False'){
                setErrorMessage(data.error || "Failed to fetch movie details.");
                return;
            }
        }
        catch(error){
            console.error(`Error: ${error.message}`)
            setErrorMessage("Error fetching movies. Please try again later. ");
        }
        finally {
            setIsLoading(false);
        }
    }

    const fetchMovieVideo = async () => {
        setIsLoading(true);
        setErrorMessage('');
        try{
            const endpoint = `${API_BASE_URL}/movie/${movieId}/videos`;
            const response = await fetch(endpoint, API_OPTIONS);
            if (!response.ok){
                throw new Error('Failed to fetch movie videos.');
            }
            const data = await response.json();
            setVideo(data.results.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official) || {})
            if (data === 'False'){
                setErrorMessage(data.error || "Failed to fetch movie videos.");
                return;
            }
        }
        catch(error){
            console.error(`Error: ${error.message}`)
            setErrorMessage("Error fetching movies. Please try again later. ");
        }
        finally {
            setIsLoading(false);
        }
    }

    const getRecommendedMovies = async() => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const endpoint = `${API_BASE_URL}/movie/${movieId}/recommendations`;
            const response = await fetch(endpoint, API_OPTIONS);
            if (!response.ok){
                throw new Error('Failed to fetch recommended movies.');
            }
            const data = await response.json();
            setRecommendedMoviesList(data.results || []);
            if (data.response === 'False'){
                setErrorMessage(data.error || "Failed to fetch recommended movies.");
                setRecommendedMoviesList(data.results || []);
                return;
            }
        }
        catch(error){
                console.error(`Error: ${error.message}`)
                setErrorMessage("Error fetching movies. Please try again later. ");
            }
        finally {
                setIsLoading(false);
            }
    }

    useEffect(() => {
        if (movieId) {
            fetchMovieDetails();
            fetchMovieVideo();
            getRecommendedMovies();
        }
    }, [movieId]);

    return (
        <div className="movie-detail">
            <section className="movie-information">
                <img src="/close.svg" alt="Close" onClick={() => setIsModalOpen(false)} className="close-icon"/>
                <div className="movie-header">
                    <h2>{movieDetails.title} {movieDetails.title !== movieDetails.original_title && ` - ${movieDetails.original_title}`}</h2>
                    <p className="btn-style"><img src='/star.svg' alt="star"/> {movieDetails?.vote_average?.toFixed(1)}/10 ({formatNumber(movieDetails?.vote_count)})</p>
                </div>
                <p>{`${movieDetails?.release_date?.split('-')[0]} • ${Math.trunc(movieDetails?.runtime/60)}h ${movieDetails?.runtime%60}min`}</p>
                <div className="movie-poster">
                    <img src={movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500/${movieDetails.poster_path}` : './no-poster.png'} alt={movieDetails.title} />
                    {
                        video && (
                            <iframe

                                src={`https://www.youtube.com/embed/${video.key}`}
                                title={movieDetails?.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        )
                    }
                </div>
                <div className="movie-description">
                    {
                        movieData.map(data => (
                            (data.value !== "$0" && data.value !== "") && (
                                <div className="movie-data" key={data.title}>
                                    <h3 className="description-title">{data.title}</h3>
                                    {
                                        Array.isArray(data.value)
                                            ? (
                                                data.title === "Genre" ? (
                                                    <div className="w-full flex items-center justify-between">
                                                        <div className="flex gap-2">
                                                            {data.value.map(genre => <p key={genre} className="btn-style">{genre}</p>)}
                                                        </div>
                                                        {movieDetails?.homepage && (<a href={movieDetails?.homepage} target="_blank" rel="noopener noreferrer">Visit Homepage</a>)}
                                                    </div>
                                                ) : <p className="description-text">{data.value.join(' • ')}</p>
                                            ) : <p className={data.title !== "Overview" ? "description-text" : ""}>{data.value}</p>
                                    }

                                </div>
                            )
                        ))
                    }
                </div>
            </section>
            {
                isLoading ? <Spinner/> :
                errorMessage ? <p className="text-red-500 ">{errorMessage}</p> :
                <section className="recommended">
                    <h2>Recommendations</h2>
                    <ul>
                        {
                            recommendedMoviesList.length > 0 && (
                                recommendedMoviesList.map(movie => (
                                    <li key={movie.id} onClick={() => {
                                        onSelectRecommendedMovie(movie.id)
                                        autoScrollUp()
                                    }}>
                                        <img src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`} alt={movie.title}/>
                                        <h3>{movie.title}</h3>
                                    </li>
                                ))
                            )
                        }
                    </ul>
                </section>
            }
        </div>
    )
}

export default MovieDetailModal;