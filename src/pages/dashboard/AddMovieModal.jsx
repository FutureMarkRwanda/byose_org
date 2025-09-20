// src/components/AddMovieModal.jsx
import React, { useState } from 'react';
import {useNotification} from "../../context/NotificationContext.jsx";

// eslint-disable-next-line react/prop-types
const AddMovieModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    poster: '',
    backdrop: '',
    category: '',
    trailer_url: '',
    tags: [],
    movie_type: 'movie',
    description: '',
  });
  const { showNotification } = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tags') {
      setFormData((prev) => ({ ...prev, tags: value.split(',').map((t) => t.trim()) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.poster || !formData.backdrop || !formData.category || !formData.description || !formData.movie_type) {
      showNotification('All required fields must be filled', 'error');
      return;
    }
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add New Movie</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Title *"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            name="poster"
            placeholder="Poster URL *"
            value={formData.poster}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            name="backdrop"
            placeholder="Backdrop URL *"
            value={formData.backdrop}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Category *"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            name="trailer_url"
            placeholder="Trailer URL"
            value={formData.trailer_url}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma separated)"
            value={formData.tags.join(', ')}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
          />
          <select
            name="movie_type"
            value={formData.movie_type}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
            required
          >
            <option value="movie">Movie</option>
            <option value="series">Series</option>
          </select>
          <textarea
            name="description"
            placeholder="Description *"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded mr-2">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMovieModal;