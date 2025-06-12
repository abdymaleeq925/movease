import {useEffect, useState} from "react";
import {useDebounce} from "react-use";

import {useMovies, useTrendingMovies} from "./hooksnhelpers/useMovies.js";
import Search from "./components/Search.jsx";
import Spinner from "./hooksnhelpers/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {updateSearchCount} from "./appwrite.js";
import MovieDetail from "./components/MovieDetailModal.jsx";

const App = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMovieId, setSelectedMovieId] = useState(null);
    const [page, setPage] = useState(1);

    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

    const {data: movies, isLoading: isMoviesLoading, error: moviesError} = useMovies(debouncedSearchTerm, page);
    const {trendingMovies, isLoading: isTrendingLoading, error: trendingError} = useTrendingMovies();

    const handleSelect = (selectedMovieId) => {
        setSelectedMovieId(selectedMovieId);
        setIsModalOpen(true);
    }

    const handlePage = (command) => {
        if (isMoviesLoading) return;
        command === "next" ? setPage(page + 1) : setPage(page - 1);
        window.scrollTo({top: 1250, behavior: 'smooth'});
    }

    useEffect(() => {
        if (debouncedSearchTerm && movies?.results?.length > 0) {
            updateSearchCount(debouncedSearchTerm, movies.results[0]);
        }
    }, [movies, debouncedSearchTerm]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearchTerm]);

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
                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
                <section className="trending">
                    <h2>Trending Movies</h2>
                    {
                        isTrendingLoading ? <Spinner/> :
                            trendingError ? <p className="text-red-500 ">{trendingError.message}</p> :
                                <ul>
                                    {
                                        trendingMovies?.length > 0 && (
                                            trendingMovies?.map((movie, index) => (
                                                <li key={movie.$id}>
                                                    <p>{index + 1}</p>
                                                    <img src={movie.poster_url} alt={movie.searchTerm}/>
                                                </li>
                                            ))
                                        )
                                    }
                                </ul>
                    }
                </section>
                <section className="all-movies">
                    <h2 className="mt-[40px]">All Movies</h2>
                    {
                        isMoviesLoading ? <Spinner/> :
                            moviesError ? <p className="text-red-500 ">{moviesError.message}</p> :
                                <ul>
                                    {
                                        movies?.results?.map(movie => (
                                            <MovieCard key={movie.id} movie={movie}
                                                       onClick={() => handleSelect(movie?.id)}/>
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
