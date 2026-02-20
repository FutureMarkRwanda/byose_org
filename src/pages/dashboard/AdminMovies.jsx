import { useState, useEffect, useMemo } from 'react';
import { fetchData, deleteData, returnToken, formatDate } from '../../utils/helper.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import MovieDetailsModal from './MovieDetailsModal.jsx';
import { server } from "../../config/server_api.js";
import { 
    MdSearch, 
    MdMovie, 
    MdTv, 
    MdDeleteOutline, 
    MdOutlineEdit,
    MdChevronLeft,
    MdChevronRight,
    MdAdd
} from "react-icons/md";

const AdminMovies = () => {
    const { showNotification } = useNotification();
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 6; // Balanced limit for UI harmony

    const [filters, setFilters] = useState({
        movie_type: '',
        search: '',
    });

const loadMovies = async () => {
    setIsLoading(true);
    const url = `${server}/movies?limit=100&populate=true`; 
    const result = await fetchData(url, returnToken());
    
    if (!result.error) {
        // Robust extraction
        const data = result.data?.data;
        const extractedMovies = Array.isArray(data) ? data : (data?.movies || []);
        setMovies(extractedMovies);
    }
    setIsLoading(false);
};

    useEffect(() => { loadMovies(); }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    // Filter Logic
    const filteredMovies = useMemo(() => {
        return (movies || []).filter(m => 
            m.title?.toLowerCase().includes(filters.search.toLowerCase()) &&
            (filters.movie_type === '' || m.movie_type === filters.movie_type)
        );
    }, [movies, filters]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredMovies.length / rowsPerPage);
    const paginatedMovies = filteredMovies.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this title permanently?')) return;
        const result = await deleteData(`${server}/movies/${id}`, returnToken());
        if (!result.error) {
            showNotification('Content removed', 'success');
            loadMovies();
        }
    };

    return (
        <div className="space-y-6 animate-slide-entrance pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div>
                    <h1 className="text-2xl font-bold text-[#333333]">Media Library</h1>
                    <p className="text-sm text-gray-500 font-medium">Managing {filteredMovies.length} titles in the ecosystem.</p>
                </div>
                <a href="/dashboard/byose-tv/add-movie" className="flex items-center justify-center gap-2 bg-[#195C51] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#0E3A32] shadow-lg transition-all active:scale-95">
                    <MdAdd size={20}/> New Content
                </a>
            </div>

            {/* Top Bar: Search & Filter */}
            <div className="google-card p-5 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-96 group">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#195C51]" size={20} />
                    <input 
                        type="text" 
                        name="search"
                        placeholder="Search by title..." 
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="w-full pl-12 pr-4 py-2.5 bg-[#F5F5F5] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#195C51]/10 transition-all"
                    />
                </div>
                <select 
                    name="movie_type" 
                    value={filters.movie_type} 
                    onChange={handleFilterChange}
                    className="w-full md:w-48 bg-[#F5F5F5] border-none rounded-xl p-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 outline-none cursor-pointer"
                >
                    <option value="">All Formats</option>
                    <option value="movie">Movie</option>
                    <option value="series">Series</option>
                </select>
            </div>

            {/* Table Container */}
            <div className="google-card overflow-hidden bg-white mx-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F5F5F5]/60 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Content Detail</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Format</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Created At</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {!isLoading && paginatedMovies.map((movie) => (
                                <tr key={movie._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5 flex items-center gap-5">
                                        <div className="w-12 h-16 rounded-xl overflow-hidden shadow-sm bg-gray-100 flex-shrink-0 border border-gray-100">
                                            <img src={movie.poster} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#333333] text-sm tracking-tight">{movie.title}</div>
                                            <div className="text-[10px] text-[#195C51] font-black uppercase tracking-widest">{movie.category}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            {movie.movie_type === 'series' ? <MdTv size={16}/> : <MdMovie size={16}/>}
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{movie.movie_type}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-xs font-medium text-gray-400">
                                        {formatDate(movie.createdAt)}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                onClick={() => setSelectedMovie(movie)} 
                                                className="p-2.5 rounded-xl bg-[#F5F5F5] text-gray-500 hover:bg-[#195C51] hover:text-white transition-all shadow-sm"
                                                title="Edit Metadata"
                                            >
                                                <MdOutlineEdit size={18}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(movie._id)} 
                                                className="p-2.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                title="Delete"
                                            >
                                                <MdDeleteOutline size={18}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State / Loader */}
                {isLoading && (
                    <div className="p-20 text-center space-y-4">
                        <div className="w-10 h-10 border-4 border-[#195C51]/10 border-t-[#195C51] rounded-full animate-spin mx-auto"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Syncing Media Vault...</p>
                    </div>
                )}
                {!isLoading && filteredMovies.length === 0 && (
                    <div className="p-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        No titles matching your criteria were found.
                    </div>
                )}

                {/* Pagination Footer */}
                <div className="px-8 py-5 bg-[#F5F5F5]/30 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Page {currentPage} of {totalPages || 1}
                    </p>
                    <div className="flex gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-500 disabled:opacity-30 hover:text-[#195C51] transition-all"
                        >
                            <MdChevronLeft size={20} />
                        </button>
                        <button 
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-500 disabled:opacity-30 hover:text-[#195C51] transition-all"
                        >
                            <MdChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Details/Edit Modal */}
            {selectedMovie && (
                <MovieDetailsModal 
                    movie={selectedMovie} 
                    onClose={() => { setSelectedMovie(null); loadMovies(); }} 
                />
            )}
        </div>
    );
};

export default AdminMovies;