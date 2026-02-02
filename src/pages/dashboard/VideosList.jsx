import { useState } from 'react';
import AddVideoModal from './AddVideoModal';
import EditVideoModal from './EditVideoModal';
import AddVersionModal from './AddVersionModal';
import { useNotification } from "../../context/NotificationContext.jsx";
import { deleteData, fetchData, returnToken } from "../../utils/helper.js";
import { server } from "../../config/server_api.js";
import { 
    MdAdd, 
    MdEdit, 
    MdDeleteSweep, 
    MdTranslate, 
    MdPlayCircleOutline 
} from "react-icons/md";

const VideosList = ({ movie, isSeries, onUpdate }) => {
  const [videos, setVideos] = useState(movie.videos || []);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAddVersionModal, setShowAddVersionModal] = useState(false);
  const { showNotification } = useNotification();
  const token = returnToken();

  const handleUpdate = async () => {
    const updated = await fetchData(`${server}/movies/${movie._id}?populate=true`, token);
    if (!updated.error) {
      setVideos(updated.data?.movie?.videos || updated.data?.videos || []);
    }
    onUpdate();
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Permanently delete this episode?')) return;
    const result = await deleteData(`${server}/videos/${videoId}`, token);
    if (!result.error) {
        showNotification('Video purged from library', 'success');
        handleUpdate();
    }
  };

  const handleDeleteVersion = async (videoId, language) => {
    if (!window.confirm(`Remove ${language.toUpperCase()} version?`)) return;
    const result = await deleteData(`${server}/videos/${videoId}/version/${language}`, token);
    if (!result.error) {
        showNotification('Version removed', 'success');
        handleUpdate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Mini Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#195C51]/10 flex items-center justify-center text-[#195C51]">
                <MdPlayCircleOutline size={24} />
            </div>
            <div>
                <h3 className="text-sm font-bold text-[#333333] uppercase tracking-wider">Video Catalog</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{videos.length} Entries Found</p>
            </div>
        </div>
        <button
          onClick={() => setShowAddVideoModal(true)}
          className="flex items-center gap-2 bg-[#195C51] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0E3A32] transition-all shadow-md"
        >
          <MdAdd size={16}/> Add {isSeries ? 'Episode' : 'Video'}
        </button>
      </div>

      {/* Responsive Grid Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F5]/50 border-b border-gray-50">
                {isSeries && <th className="p-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Season</th>}
                <th className="p-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Ep</th>
                <th className="p-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Content / Versions</th>
                <th className="p-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {videos.length === 0 ? (
                  <tr>
                      <td colSpan="4" className="p-10 text-center text-[10px] font-bold uppercase tracking-widest text-gray-300 italic">No video content assigned</td>
                  </tr>
              ) : videos.map((video) => (
                <tr key={video._id} className="hover:bg-[#F5F5F5]/30 transition-colors">
                  {isSeries && <td className="p-4 text-center text-xs font-black text-gray-400">{video.season || '01'}</td>}
                  <td className="p-4 text-center">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mx-auto text-[10px] font-black text-[#333333]">
                        {video.episode}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-3">
                        <p className="text-xs text-gray-500 font-medium line-clamp-1">{video.description || "No description provided."}</p>
                        <div className="flex flex-wrap gap-2">
                            {video.versions.map((ver) => (
                                <div key={ver.language} className="group relative flex items-center gap-2 bg-white border border-gray-100 px-2 py-1 rounded-lg shadow-sm">
                                    <span className="text-[9px] font-black uppercase text-[#195C51]">{ver.language}</span>
                                    <button
                                        onClick={() => handleDeleteVersion(video._id, ver.language)}
                                        className="text-red-300 hover:text-red-500 transition-colors"
                                    >
                                        <MdDeleteSweep size={12} />
                                    </button>
                                </div>
                            ))}
                            <button 
                                onClick={() => { setSelectedVideo(video); setShowAddVersionModal(true); }}
                                className="text-[9px] font-black uppercase text-gray-400 border border-dashed border-gray-200 px-2 py-1 rounded-lg hover:border-[#195C51] hover:text-[#195C51] transition-all"
                            >
                                + Add Lang
                            </button>
                        </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setSelectedVideo(video)}
                            className="p-2 rounded-xl bg-[#F5F5F5] text-gray-500 hover:bg-[#195C51] hover:text-white transition-all"
                            title="Edit Episode"
                        >
                            <MdEdit size={16} />
                        </button>
                        <button
                            onClick={() => handleDeleteVideo(video._id)}
                            className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                            title="Remove Episode"
                        >
                            <MdDeleteSweep size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals are kept separate to maintain low DOM complexity */}
      {showAddVideoModal && (
        <AddVideoModal 
          movieId={movie._id}
          isSeries={isSeries}
          onClose={() => setShowAddVideoModal(false)}
          onAdd={handleUpdate}
        />
      )}
      {selectedVideo && !showAddVersionModal && (
        <EditVideoModal
          video={selectedVideo}
          isSeries={isSeries}
          onClose={() => setSelectedVideo(null)}
          onUpdate={handleUpdate}
        />
      )}
      {showAddVersionModal && selectedVideo && (
        <AddVersionModal
          video={selectedVideo}
          onClose={() => { setShowAddVersionModal(false); setSelectedVideo(null); }}
          onAdd={handleUpdate}
        /> 
      )}
    </div>
  );
};

export default VideosList;