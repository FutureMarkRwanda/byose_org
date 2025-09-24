// src/components/MovieDetailsModal.jsx
import { useState} from 'react';
import VideosList from './VideosList';
import {useNotification} from "../../context/NotificationContext.jsx";
import {patchData, returnToken} from "../../utils/helper.js";
import {server} from "../../config/server_api.js";

// eslint-disable-next-line react/prop-types
const MovieDetailsModal = ({ movie, onClose }) => {
  const [formData, setFormData] = useState(movie);
  const { showNotification } = useNotification();
  const token = returnToken();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tags') {
      setFormData((prev) => ({ ...prev, tags: value.split(',').map((t) => t.trim()) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await patchData(server+`/movies/${movie._id}`, formData, token);
    if (result.error) {
      showNotification(result.error, 'error');
    } else {
      showNotification('Movie updated successfully', 'success');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white p-6  w-11/12 md:w-2/3 h-screen overflow-y-auto">
          {/* eslint-disable-next-line react/prop-types */}
        <h2 className="text-xl font-bold mb-4">Edit Movie: {movie.title}</h2>
        <form onSubmit={handleSubmit}>
          {/* Similar form fields as AddMovieModal */}
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2 bg-white"
          />
          <input
            type="text"
            name="poster"
            placeholder="Poster URL"
            value={formData.poster}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2 bg-white"
          />
          <input
            type="text"
            name="backdrop"
            placeholder="Backdrop URL"
            value={formData.backdrop}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2 bg-white"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2 bg-white"
          />
          <input
            type="text"
            name="trailer_url"
            placeholder="Trailer URL"
            value={formData.trailer_url}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2 bg-white"
          />
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma separated)"
            value={formData.tags.join(', ')}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2 bg-white"
          />
          <select
            name="movie_type"
            value={formData.movie_type}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2 bg-white"
          >
            <option value={formData.movie_type}>{formData.movie_type}</option>
          </select>
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2 bg-white"
          />
          <div className="flex justify-end mb-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded mr-2">
              Close
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Update
            </button>
          </div>
        </form>

        {/* Videos Section */}
        <VideosList movie={formData} isSeries={formData.movie_type === 'series'} onUpdate={onClose} />
      </div>
    </div>
  );
};

export default MovieDetailsModal;