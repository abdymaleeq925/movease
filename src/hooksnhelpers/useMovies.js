import useSWR from "swr";
import {loadTrendingMovies} from "../appwrite.js";

export const API_BASE_URL = 'https://api.themoviedb.org/3';
export const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
export const API_OPTIONS = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    }
}

const fetcher = async(url) => {

    const response = await fetch(url, API_OPTIONS);
    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }
    if(url.includes('videos')) {
       return response.json().then(data => data.results.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official) || {})
    } else {
        return response.json();
    }

}

export const useMovies = (query = "", page = 1) => {
    const getEndpoint = () => {
        return query
            ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
            : `${API_BASE_URL}/discover/movie?page=${page}&sort_by=popularity.desc`;
    };

    const cacheKey = query ? ['movies/search', query, page] : ['movies/discover', page];

    return useSWR(cacheKey,
        () => fetcher(getEndpoint()), {
        dedupingInterval: 60000, // 1 мин - не делать одинаковые запросы чаще, чем раз в минуту
        revalidateOnFocus: false, // не обновлять при возвращении на вкладку
        revalidateIfStale: true, // обновлять, если данные устарели
        revalidateOnReconnect: true, // обновлять при восстановлении соединения
        staleTime: 7 * 24 * 60 * 60 * 1000, // 7 дней
        shouldRetryOnError: false,
    });
}

export const useMovieDetails = (movieId) => {
    const endpoint = `${API_BASE_URL}/movie/${movieId}`
    return useSWR(endpoint, fetcher, {
        dedupingInterval: 60000,
        revalidateOnFocus: false,
        revalidateIfStale: true,
        revalidateOnReconnect: true,
        staleTime: 7 * 24 * 60 * 60 * 1000, // 7 дней
        shouldRetryOnError: false,
    });
}

export const useTrendingMovies = () => {
    const { data, isLoading, error } = useSWR('trending-movies', () => loadTrendingMovies(), {
        revalidateOnFocus: false,
        revalidateIfStale: true,
        revalidateOnReconnect: true,
        staleTime: 10 * 60 * 1000, // 10 минут
        shouldRetryOnError: false,
    });
    return { trendingMovies: data, isLoading, error}
}

export const useMovieVideo = (movieId) => {
    const endpoint = `${API_BASE_URL}/movie/${movieId}/videos`
    return useSWR(endpoint, fetcher, {
        dedupingInterval: 60000,
        revalidateOnFocus: false,
        revalidateIfStale: true,
        revalidateOnReconnect: true,
        staleTime: 7 * 24 * 60 * 60 * 1000, // 7 дней
    })
}

export const useRecommendedMovies = (movieId) => {
    const endpoint = `${API_BASE_URL}/movie/${movieId}/recommendations`
    return useSWR(endpoint, fetcher, {
        dedupingInterval: 60000,
        revalidateOnFocus: false,
        revalidateIfStale: true,
        revalidateOnReconnect: true,
        staleTime: 30 * 60 * 1000, // 30 минут
    })
}