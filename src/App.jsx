import './App.css'
import {useEffect, useState} from "react";
import {useDebounce} from "react-use";

import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {loadTrendingMovies, updateSearchCount} from "./appwrite.js";
import MovieDetail from "./components/MovieDetailModal.jsx";

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    }
};

const App = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [trendingMoviesList, setTrendingMoviesList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMovieId, setSelectedMovieId] = useState(null);
    const [page, setPage] = useState(1);

    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

    const handleSelect = (selectedMovieId) => {
        setSelectedMovieId(selectedMovieId);
        setIsModalOpen(true);
    }

    const handlePage = (command) => {
        command === "next" ? setPage(page + 1) : setPage(page - 1);
        window.scrollTo({ top: 1250, behavior: 'smooth' });
    }

    const fetchMovies = async (query = "") => {
        setIsLoading(true);
        setErrorMessage('');
        try{
            const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}` : `${API_BASE_URL}/discover/movie?page=${page}&sort_by=popularity.desc`;
            const response = await fetch(endpoint, API_OPTIONS);
            if (!response.ok){
                throw new Error('Failed to fetch movies.');
            }
            const data = await response.json();
            if (data.response === 'False'){
                setErrorMessage(data.error || "Failed to fetch movies.");
                setMovieList([]);
                return;
            }
            setMovieList(data.results || []);
            if( query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
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

    const getTrendingMovies = async() => {
        try{
            const response = await loadTrendingMovies();
            setTrendingMoviesList(response);
        }
        catch(error){
            console.error(`Error: ${error.message}`);
        }
    }

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm, page]);
    useEffect(() => {
        setPage(1);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        getTrendingMovies();
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isModalOpen]);

    return (
        <main>
            <div className="pattern"/>
            <div className="wrapper">
                <header>
                    <img src='/logo.png' alt='Logo'/>
                    <img src='/hero-img.png' alt='Hero Banner'/>
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without Hassle</h1>
                </header>
                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <section className="trending">
                    <h2>Trending Movies</h2>
                    <ul>
                        {
                            trendingMoviesList.length > 0 && (
                                trendingMoviesList.map((movie, index) => (
                                    <li key={movie.$id}>
                                        <p>{index+1}</p>
                                        <img src={movie.poster_url} alt={movie.searchTerm}/>
                                    </li>
                                ))
                            )
                        }
                    </ul>
                </section>
                <section className="all-movies">
                    <h2 className="mt-[40px]">All Movies</h2>
                    {
                        isLoading ? <Spinner/> :
                        errorMessage ? <p className="text-red-500 ">{errorMessage}</p> :
                         <ul>
                             {
                                 movieList.map(movie => (
                                     <MovieCard key={movie.id} movie={movie} onClick={() => handleSelect(movie?.id)}/>
                                 ))
                             }
                         </ul>
                    }
                </section>
                <section className="pagination">
                    <img src='/arrow-left.svg' alt='Arrow Left' onClick={() => handlePage("prev")}/>
                    <p>{page}/50</p>
                    <img src='/arrow-right.svg' alt='Arrow Right' onClick={() => handlePage("next")}/>
                </section>
                {
                    isModalOpen &&
                    <div className="fixed inset-0 bg-[#0F0D23]/50 backdrop-blur-[60px] z-40">
                    <MovieDetail
                        api={{API_BASE_URL, API_OPTIONS}}
                        setIsModalOpen={setIsModalOpen}
                        movieId={selectedMovieId}
                        onSelectRecommendedMovie={handleSelect}
                    />
                    </div>
                }
            </div>
        </main>
    )
}

export default App
