import React, {useState, useEffect} from 'react';
import Spinner from "../hooksnhelpers/Spinner.jsx";
import {
    API_BASE_URL,
    API_OPTIONS,
    useMovieDetails,
    useMovieVideo,
    useRecommendedMovies
} from "../hooksnhelpers/useMovies.js";

const MovieDetailModal = ({setIsModalOpen, movieId, onSelectRecommendedMovie}) => {

    const {data: movieDetails, isLoading: isDetailsLoading, error: detailsError} = useMovieDetails(movieId);
    const {data: movieVideo, isLoading: isVideoLoading, error: videoError} = useMovieVideo(movieId);
    const {data: recommendedMovies, isLoading: isRecommendedLoading, error: recommendedError} = useRecommendedMovies(movieId);
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
    ];

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

    return (
        <div className="movie-detail">
            {
                isDetailsLoading ? <Spinner/> :
                detailsError ? <p className="text-red-500 ">{detailsError.message}</p> :
                <section className="movie-information">
                    <img src="/close.svg" alt="Close" onClick={() => setIsModalOpen(false)} className="close-icon"/>
                    <div className="movie-header">
                        <h2>{movieDetails?.title} {movieDetails?.title !== movieDetails?.original_title && ` - ${movieDetails?.original_title}`}</h2>
                        <p className="btn-style"><img src='/star.svg' alt="star"/> {movieDetails?.vote_average?.toFixed(1)}/10 ({formatNumber(movieDetails?.vote_count)})</p>
                    </div>
                    <p>{`${movieDetails?.release_date?.split('-')[0]} • ${Math.trunc(movieDetails?.runtime/60)}h ${movieDetails?.runtime%60}min`}</p>
                    <div className="movie-poster">
                        <img src={movieDetails?.poster_path
                            ? `https://image.tmdb.org/t/p/w500/${movieDetails?.poster_path}`
                            : './no-poster.png'} alt={movieDetails?.title} />
                        {
                            isVideoLoading ? <Spinner/> :
                            videoError ? <p className="text-red-500 ">{videoError.message}</p> :
                                <iframe
                                    src={`https://www.youtube.com/embed/${movieVideo.key}`}
                                    title={movieDetails?.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                        }
                    </div>
                    <div className="movie-description">
                        {
                            movieData.map(data => (
                                (data.value !== "$0" && data.value !== "") &&
                                    <div className="movie-data" key={data.title}>
                                        <h3 className="description-title">{data.title}</h3>
                                        {
                                            Array.isArray(data.value)
                                                ? (
                                                    data.title === "Genre" ? (
                                                        <div className="genre-block">
                                                            <div className="genre-list">
                                                                {data.value.map(genre => <p key={genre} className="btn-style">{genre}</p>)}
                                                            </div>
                                                            {movieDetails?.homepage && (<a href={movieDetails?.homepage} target="_blank" rel="noopener noreferrer" className="hidden lg:inline">Visit Homepage</a>)}
                                                        </div>
                                                    ) : <p className="description-text">{data.value.join(' • ')}</p>
                                                ) : <p className={data.title !== "Overview" ? "description-text" : ""}>{data.value}</p>
                                        }
                                    </div>
                            ))
                        }
                    </div>
                </section>
            }
            <section className="recommended">
                <h2>Recommendations</h2>
                {
                    isRecommendedLoading ? <Spinner/> :
                    recommendedError ? <p className="text-red-500 ">{recommendedError.message}</p> :
                    <ul>
                        {
                            recommendedMovies?.results?.length > 0 && (
                                recommendedMovies?.results?.map(movie => (
                                    <li key={movie.id} onClick={() => {
                                        onSelectRecommendedMovie(movie.id)
                                        autoScrollUp()
                                    }}>
                                        <img src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`} alt={movie.title}/>
                                        <p>{movie.title}</p>
                                    </li>
                                ))
                            )
                        }
                    </ul>
                }
            </section>
        </div>
    )
}

export default MovieDetailModal;