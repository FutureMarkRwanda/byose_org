// src/components/VideosList.jsx
import { useState } from 'react';
import AddVideoModal from './AddVideoModal';
import EditVideoModal from './EditVideoModal';
import AddVersionModal from './AddVersionModal';
import {useNotification} from "../../context/NotificationContext.jsx";
import {deleteData, fetchData, returnToken} from "../../utils/helper.js";
import {server} from "../../config/server_api.js";

// eslint-disable-next-line react/prop-types
const VideosList = ({ movie, isSeries, onUpdate }) => {
    // eslint-disable-next-line react/prop-types
  const [videos, setVideos] = useState(movie.videos || []);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAddVersionModal, setShowAddVersionModal] = useState(false);
  const { showNotification } = useNotification();
  const token = returnToken();

  const handleAddVideo = (newVideo) => {
    setVideos((prev) => [...prev, newVideo]);
    setShowAddVideoModal(false);
    onUpdate();
  };

  const handleEditVideo = (video) => {
    setSelectedVideo(video);
  };

  const handleUpdateVideo = (updatedVideo) => {
    setVideos((prev) =>
      prev.map((v) => (v._id === updatedVideo._id ? updatedVideo : v))
    );
    setSelectedVideo(null);
    onUpdate();
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    const result = await deleteData(`${server}/videos/${videoId}`, token);
    if (result.error) {
      showNotification(result.error, 'error');
    } else {
      showNotification('Video deleted successfully', 'success');
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      onUpdate();
    }
  };

  const handleAddVersion = (videoId) => {
    setSelectedVideo(videos.find((v) => v._id === videoId));
    setShowAddVersionModal(true);
  };

  const handleVersionAdded = (updatedVideo) => {
    handleUpdateVideo(updatedVideo);
    setShowAddVersionModal(false);
  };

  const handleDeleteVersion = async (videoId, language) => {
    if (!window.confirm(`Are you sure you want to delete the ${language} version?`)) return;
    const result = await deleteData(`${server}/videos/${videoId}/version/${language}`,  token);
    if (result.error) {
      showNotification(result.error, 'error');
    } else {
      showNotification('Version deleted successfully', 'success');
      // Refresh videos
        // eslint-disable-next-line react/prop-types
      const updated = await fetchData(`${server}/movies/${movie._id}?populate=true`, token);
      if (!updated.error) {
        setVideos(updated.movie.videos);
      }
      onUpdate();
    }
  };

  return (
    <div>
        {/* eslint-disable-next-line react/prop-types */}
      <h3 className="text-lg font-bold mb-2">Videos for {movie.title}</h3>
      <button
        onClick={() => setShowAddVideoModal(true)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add New Video
      </button>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              {isSeries && <th className="p-2 border">Season</th>}
              <th className="p-2 border">Episode</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Versions</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video._id}>
                {isSeries && <td className="p-2 border">{video.season || 'N/A'}</td>}
                <td className="p-2 border">{video.episode}</td>
                <td className="p-2 border">{video.description}</td>
                <td className="p-2 border">
                  {video.versions.map((ver) => (
                    <div key={ver.language} className="flex justify-between">
                      <span>{ver.language}: {ver.streamingLink}</span>
                      <button
                        onClick={() => handleDeleteVersion(video._id, ver.language)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleEditVideo(video)}
                    className="px-2 py-1 bg-green-500 text-white rounded mr-2 hover:bg-green-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleAddVersion(video._id)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600"
                  >
                    Add/Update Version
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(video._id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAddVideoModal && (
          // eslint-disable-next-line react/prop-types
        <AddVideoModal movieId={movie._id}
          isSeries={isSeries}
          onClose={() => onUpdate()}
          onAdd={handleAddVideo}
        />
      )}
      {selectedVideo && !showAddVersionModal && (
        <EditVideoModal
          video={selectedVideo}
          isSeries={isSeries}
          onClose={() => setSelectedVideo(null)}
          onUpdate={handleUpdateVideo}
        />
      )}
      {showAddVersionModal && selectedVideo && (
        <AddVersionModal
          video={selectedVideo}
          onClose={() => setShowAddVersionModal(false)}
          onAdd={handleVersionAdded}
        /> )}
    </div>
  );
};

export default VideosList;