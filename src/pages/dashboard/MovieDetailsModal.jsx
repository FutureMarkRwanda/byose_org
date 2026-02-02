import { useState } from 'react';
import VideosList from './VideosList';
import { useNotification } from "../../context/NotificationContext.jsx";
import { patchData, returnToken } from "../../utils/helper.js";
import { server } from "../../config/server_api.js";
import { MdClose, MdSave } from "react-icons/md";

const MovieDetailsModal = ({ movie, onClose }) => {
  const [formData, setFormData] = useState(movie);
  const { showNotification } = useNotification();
  const token = returnToken();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'tags' ? value.split(',') : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await patchData(`${server}/movies/${movie._id}`, formData, token);
    if (!result.error) {
      showNotification('Catalog entry updated', 'success');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      <div className="absolute inset-0 bg-[#0B121A]/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl h-full flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-[#F5F5F5]/50">
          <div>
            <h2 className="text-2xl font-bold text-[#333333]">{movie.title}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#195C51]">Master Metadata Control</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
            <MdClose size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
            <div className="grid lg:grid-cols-12 gap-12">
                {/* Form Section */}
                <form onSubmit={handleSubmit} className="lg:col-span-5 space-y-6">
                    <div className="space-y-4">
                        <div className="aspect-video rounded-3xl overflow-hidden google-card relative group">
                            <img src={formData.backdrop} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <span className="text-white text-xs font-bold">Update Backdrop URL Below</span>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Title</label>
                            <input name="title" value={formData.title} onChange={handleChange} className="w-full bg-[#F5F5F5] border-none rounded-xl p-3 text-sm outline-none font-bold" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                                <input name="category" value={formData.category} onChange={handleChange} className="w-full bg-[#F5F5F5] border-none rounded-xl p-3 text-sm outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Type</label>
                                <div className="p-3 bg-gray-100 rounded-xl text-xs font-bold text-gray-500 uppercase text-center">{formData.movie_type}</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm outline-none h-32 resize-none" />
                        </div>

                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#195C51] text-white py-4 rounded-2xl font-bold hover:bg-[#0E3A32] transition-all shadow-lg active:scale-95">
                            <MdSave size={20}/> Save Changes
                        </button>
                    </div>
                </form>

                {/* Videos/Episodes Section */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-[#F5F5F5] rounded-[2.5rem] p-6 border border-gray-100">
                        <VideosList movie={formData} isSeries={formData.movie_type === 'series'} onUpdate={onClose} />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsModal;