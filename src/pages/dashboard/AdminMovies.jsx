// src/pages/AdminMovies.jsx
import React, {useState, useEffect} from 'react';
import {
    fetchData,
    sendData,
    deleteData,
    returnToken,
    handleLogout,
} from '../../utils/helper.js';
import {useNotification} from '../../context/NotificationContext.jsx';
import MovieDetailsModal from './MovieDetailsModal.jsx';
import AddMovieModal from './AddMovieModal.jsx';
import {server} from "../../config/server_api.js";

const AdminMovies = () => {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
    });
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        category: '',
        movie_type: '',
        tags: '',
        search: '',
        sort: '-createdAt',
        populate: 'true',
    });
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const {showNotification} = useNotification();
    const token = returnToken();

    const loadMovies = async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const url = server + `/movies?${queryParams}`;
            const result = await fetchData(url, token);

            if (result.error) {
                showNotification(result.error, 'error');
                setErrorMessage(result.error);
                if (
                    result.error.toLowerCase().includes('token') ||
                    result.error.toLowerCase().includes('auth')
                ) {
                    handleLogout();
                }
            } else {
                // ✅ extract correctly
                const moviesData = result.data?.data?.movies || [];
                const paginationData = result.data?.data?.pagination || {};

                setMovies(moviesData);
                setPagination(paginationData);
            }
        } catch (err) {
            console.error(err);
            setErrorMessage('Failed to load movies. Please try again.');
            showNotification('Failed to load movies', 'error');
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        loadMovies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handleFilterChange = (e) => {
        const {name, value} = e.target;
        setFilters((prev) => ({...prev, [name]: value, page: 1}));
    };

    const handlePageChange = (newPage) => {
        setFilters((prev) => ({...prev, page: newPage}));
    };

    const handleDeleteMovie = async (id) => {
        if (!window.confirm('Are you sure you want to delete this movie and its videos?')) return;
        try {
            const result = await deleteData(`${server}/movies/${id}`, null, token);
            if (result.error) {
                showNotification(result.error, 'error');
            } else {
                showNotification('Movie deleted successfully', 'success');
                loadMovies();
            }
        } catch (err) {
            console.error(err);
            showNotification('Error deleting movie', 'error');
        }
    };

    const handleEditMovie = (movie) => {
        setSelectedMovie(movie);
    };

    const handleCloseModal = () => {
        setSelectedMovie(null);
        setShowAddModal(false);
        loadMovies();
    };

    const handleAddMovie = async (newMovie) => {
        try {
            const result = await sendData(server + '/movies', newMovie, token);
            if (result.error) {
                showNotification(result.error, 'error');
            } else {
                showNotification('Movie added successfully', 'success');
                handleCloseModal();
            }
        } catch (err) {
            console.error(err);
            showNotification('Error adding movie', 'error');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Movies</h1>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <input
                    type="text"
                    name="search"
                    placeholder="Search..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="p-2 border rounded bg-white"
                />
                <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="p-2 border rounded bg-white"
                />
                <input
                    type="text"
                    name="tags"
                    placeholder="Tags (comma separated)"
                    value={filters.tags}
                    onChange={handleFilterChange}
                    className="p-2 border rounded bg-white"
                />
                <select
                    name="movie_type"
                    value={filters.movie_type}
                    onChange={handleFilterChange}
                    className="p-2 border rounded bg-white"
                >
                    <option value="">All Types</option>
                    <option value="movie">Movie</option>
                    <option value="series">Series</option>
                </select>
                <select
                    name="sort"
                    value={filters.sort}
                    onChange={handleFilterChange}
                    className="p-2 border rounded bg-white"
                >
                    <option value="-createdAt">Newest First</option>
                    <option value="createdAt">Oldest First</option>
                    <option value="title">Title A-Z</option>
                    <option value="-title">Title Z-A</option>
                </select>
                {/* Add Button */}
            <a
                // onClick={() => setShowAddModal(true)}
                href={"/dashboard/add-movie"}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Add New Movie
            </a>
            </div>


            {/* Loader & Error */}
            {isLoading && <p className="text-center">Loading movies...</p>}
            {errorMessage && !isLoading && (
                <p className="text-center text-red-500">{errorMessage}</p>
            )}

            {/* Movies Table */}
            {!isLoading && !errorMessage && (
                <div className="overflow-x-auto">
                    {movies.length === 0 ? (
                        <p className="text-center py-4">No movies found.</p>
                    ) : (
                        <table className="min-w-full bg-white border">
                            <thead>
                            <tr>
                                <th className="p-2 border">Title</th>
                                <th className="p-2 border">Type</th>
                                <th className="p-2 border">Category</th>
                                <th className="p-2 border">Tags</th>
                                <th className="p-2 border">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {movies.map((movie) => (
                                <tr key={movie._id}>
                                    <td className="p-2 border">{movie.title}</td>
                                    <td className="p-2 border">{movie.movie_type}</td>
                                    <td className="p-2 border">{movie.category}</td>
                                    <td className="p-2 border">
                                        {Array.isArray(movie.tags) ? movie.tags.join(', ') : ''}
                                    </td>
                                    <td className="p-2 border">
                                        <button
                                            onClick={() => handleEditMovie(movie)}
                                            className="px-2 py-1 bg-green-500 text-white rounded mr-2 hover:bg-green-600"
                                        >
                                            View/Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteMovie(movie._id)}
                                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Pagination */}
            {!isLoading && !errorMessage && movies.length > 0 && (
                <div className="flex justify-center mt-4">
                    {pagination.hasPrevPage && (
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            className="px-4 py-2 bg-gray-200 rounded mr-2"
                        >
                            Previous
                        </button>
                    )}
                    <span className="px-4 py-2">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
                    {pagination.hasNextPage && (
                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            className="px-4 py-2 bg-gray-200 rounded ml-2"
                        >
                            Next
                        </button>
                    )}
                </div>
            )}

            {/* Modals */}
            {selectedMovie && (
                <MovieDetailsModal movie={selectedMovie} onClose={handleCloseModal}/>
            )}
        </div>
    );
};

export default AdminMovies;
