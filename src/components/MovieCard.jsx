import React from 'react';

export const movieGenres = [
    {
        "id": 28,
        "name": "Action"
    },
    {
        "id": 12,
        "name": "Adventure"
    },
    {
        "id": 16,
        "name": "Animation"
    },
    {
        "id": 35,
        "name": "Comedy"
    },
    {
        "id": 80,
        "name": "Crime"
    },
    {
        "id": 99,
        "name": "Documentary"
    },
    {
        "id": 18,
        "name": "Drama"
    },
    {
        "id": 10751,
        "name": "Family"
    },
    {
        "id": 14,
        "name": "Fantasy"
    },
    {
        "id": 36,
        "name": "History"
    },
    {
        "id": 27,
        "name": "Horror"
    },
    {
        "id": 10402,
        "name": "Music"
    },
    {
        "id": 9648,
        "name": "Mystery"
    },
    {
        "id": 10749,
        "name": "Romance"
    },
    {
        "id": 878,
        "name": "Science Fiction"
    },
    {
        "id": 10770,
        "name": "TV Movie"
    },
    {
        "id": 53,
        "name": "Thriller"
    },
    {
        "id": 10752,
        "name": "War"
    },
    {
        "id": 37,
        "name": "Western"
    }
];

const MovieCard = ({ movie: { title, vote_average, poster_path, release_date, genre_ids}, onClick }) => {
    return (
        <div className="movie-card" onClick={() => onClick?.()}>
            <img src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : './no-poster.png'} alt={title} />
            <h3>{title}</h3>
            <div className="content">
                <div className="rating">
                    <img src="./star.svg" alt="Rating"/>
                    <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
                </div>
                <p className="genre">{` • ${movieGenres.filter(genre => genre_ids.includes(genre.id)).map(genre => genre.name)[0]}`}</p>
                <p className="year">{` • ${release_date ? release_date.split('-')[0] : "N/A"}`}</p>
            </div>
        </div>
    )
}

export default MovieCard;