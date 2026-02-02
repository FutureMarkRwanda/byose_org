import React, { useState } from "react";
import { generateYouTubeEmbedURL, returnToken, sendData } from "../../utils/helper.js";
import { server } from "../../config/server_api.js";
import { 
    MdOutlineMovieFilter, 
    MdOutlineSlowMotionVideo, 
    MdAdd, 
    MdClose, 
    MdPublish,
    MdVideoLibrary,
    MdOutlineLabel,
    MdOutlineDescription
} from "react-icons/md";

const VERSION_LANGUAGES = ["rw", "en", "fr", "es", "de", "org", "chn", "jp", "in", "ko"];

const initialEpisode = (isSeries) => ({
    season: isSeries ? "" : undefined,
    episode: "",
    description: "",
    versions: [{ language: "en", streamingLink: "" }]
});

const initialMovieState = {
    title: "",
    poster: "",
    backdrop: "",
    trailer_url: "",
    category: "",
    tags: [],
    movie_type: "movie",
    description: "",
    episodes: []
};

export default function AddMovie() {
    const [form, setForm] = useState(initialMovieState);
    const [tagInput, setTagInput] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "movie_type") {
            setForm(prev => ({ ...prev, movie_type: value, episodes: [] }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
            setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            setTagInput("");
        }
    };

    const handleRemoveTag = (index) => {
        setForm(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
    };

    const handleAddEpisode = () => {
        setForm(prev => ({ ...prev, episodes: [...prev.episodes, initialEpisode(form.movie_type === "series")] }));
    };

    const handleRemoveEpisode = (index) => {
        setForm(prev => ({ ...prev, episodes: prev.episodes.filter((_, i) => i !== index) }));
    };

    const handleEpisodeChange = (idx, field, value) => {
        setForm(prev => {
            const episodes = [...prev.episodes];
            episodes[idx][field] = value;
            return { ...prev, episodes };
        });
    };

    const handleVersionChange = (epIdx, vIdx, field, value) => {
        setForm(prev => {
            const episodes = [...prev.episodes];
            episodes[epIdx].versions[vIdx][field] = value;
            return { ...prev, episodes };
        });
    };

    const handleAddVersion = (epIdx) => {
        setForm(prev => {
            const episodes = [...prev.episodes];
            episodes[epIdx].versions.push({ language: "en", streamingLink: "" });
            return { ...prev, episodes };
        });
    };

    const handleRemoveVersion = (epIdx, vIdx) => {
        setForm(prev => {
            const episodes = [...prev.episodes];
            episodes[epIdx].versions.splice(vIdx, 1);
            return { ...prev, episodes };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.episodes.length === 0) return alert("Please add at least one video/episode");
        setSubmitting(true);
        const { error } = await sendData(server + "/movies", form, returnToken());
        setSubmitting(false);
        if (!error) {
            alert("Content Published successfully");
            setForm(initialMovieState);
        }
    };

    return (
        <div className="space-y-8 animate-slide-entrance pb-20">
            <div className="px-2">
                <h1 className="text-3xl font-bold text-[#333333]">Production Studio</h1>
                <p className="text-sm text-gray-500 font-medium tracking-tight">Create and configure high-fidelity media assets.</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COLUMN: THE FORM */}
                <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8 px-2">
                    
                    {/* 1. Basic Identity */}
                    <div className="google-card p-10 bg-white space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                            <MdOutlineMovieFilter className="text-[#195C51]" size={24}/>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#333333]">Core Metadata</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Title</label>
                                <input name="title" value={form.title} onChange={handleChange} required placeholder="Production Title"
                                       className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#195C51]/10" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                                    <input name="category" value={form.category} onChange={handleChange} required placeholder="Action, Drama..."
                                           className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Format</label>
                                    <select name="movie_type" value={form.movie_type} onChange={handleChange}
                                            className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm outline-none cursor-pointer">
                                        <option value="movie">Movie</option>
                                        <option value="series">Series</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} required placeholder="Storyline overview..."
                                          className="w-full bg-[#F5F5F5] border-none rounded-3xl p-5 text-sm outline-none h-32 resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* 2. Tags System */}
                    <div className="google-card p-10 bg-white space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                            <MdOutlineLabel className="text-[#195C51]" size={24}/>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#333333]">Search Tags</h2>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                value={tagInput} 
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                                placeholder="Add genre tag..."
                                className="flex-grow bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm outline-none"
                            />
                            <button type="button" onClick={handleAddTag} className="bg-[#195C51] text-white px-6 rounded-2xl font-bold text-xs uppercase tracking-widest">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {form.tags.map((tag, i) => (
                                <span key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#195C51]/10 text-[#195C51] text-[10px] font-black uppercase tracking-widest">
                                    {tag} <MdClose className="cursor-pointer" onClick={() => handleRemoveTag(i)}/>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* 3. Assets & Links */}
                    <div className="google-card p-10 bg-white space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                            <MdOutlineSlowMotionVideo className="text-[#195C51]" size={24}/>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#333333]">Visual Assets</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Poster URL</label>
                                <input name="poster" value={form.poster} onChange={handleChange} className="w-full bg-[#F5F5F5] border-none rounded-xl p-4 text-xs outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Backdrop URL</label>
                                <input name="backdrop" value={form.backdrop} onChange={handleChange} className="w-full bg-[#F5F5F5] border-none rounded-xl p-4 text-xs outline-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trailer URL (YouTube)</label>
                            <input name="trailer_url" value={form.trailer_url} onChange={handleChange} placeholder="https://youtube.com/..."
                                   className="w-full bg-[#F5F5F5] border-none rounded-xl p-4 text-xs outline-none font-mono" />
                        </div>
                    </div>

                    {/* 4. Episodes / Videos */}
                    <div className="google-card p-10 bg-white space-y-8">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-3">
                                <MdVideoLibrary className="text-[#195C51]" size={24}/>
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#333333]">Video Manifest</h2>
                            </div>
                            <button type="button" onClick={handleAddEpisode} className="text-[10px] font-black uppercase tracking-widest text-[#195C51] hover:underline">
                                + Add {form.movie_type === "series" ? "Episode" : "Video"}
                            </button>
                        </div>

                        <div className="space-y-10">
                            {form.episodes.map((ep, epIdx) => (
                                <div key={epIdx} className="p-8 rounded-[2.5rem] bg-[#F5F5F5]/40 border border-gray-100 space-y-6 relative animate-slide-up">
                                    <button type="button" onClick={() => handleRemoveEpisode(epIdx)} className="absolute top-6 right-6 text-red-300 hover:text-red-500">
                                        <MdClose size={20}/>
                                    </button>

                                    <div className="grid grid-cols-2 gap-6">
                                        {form.movie_type === "series" && (
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase text-gray-400">Season</label>
                                                <input type="number" placeholder="01" value={ep.season} onChange={(e) => handleEpisodeChange(epIdx, "season", e.target.value)} 
                                                       className="w-full bg-white rounded-xl p-3 text-xs outline-none border border-gray-50" />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase text-gray-400">Episode No.</label>
                                            <input type="number" placeholder="01" value={ep.episode} onChange={(e) => handleEpisodeChange(epIdx, "episode", e.target.value)}
                                                   className="w-full bg-white rounded-xl p-3 text-xs outline-none border border-gray-50" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-gray-400">Episode Synopsis</label>
                                        <input value={ep.description} onChange={(e) => handleEpisodeChange(epIdx, "description", e.target.value)}
                                               placeholder="Describe this specific video..."
                                               className="w-full bg-white rounded-xl p-3 text-xs outline-none border border-gray-50" />
                                    </div>
                                    
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[#195C51]">Encoding Versions</p>
                                            <button type="button" onClick={() => handleAddVersion(epIdx)} className="text-[9px] font-black text-gray-400 hover:text-[#195C51]">+ New Lang</button>
                                        </div>
                                        
                                        {ep.versions.map((v, vIdx) => (
                                            <div key={vIdx} className="flex gap-3 animate-slide-right">
                                                <select value={v.language} onChange={(e) => handleVersionChange(epIdx, vIdx, "language", e.target.value)}
                                                        className="bg-white rounded-xl px-3 text-[10px] font-bold outline-none border border-gray-50 uppercase shadow-sm">
                                                    {VERSION_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                                </select>
                                                <input placeholder="HLS / MP4 Stream Link" value={v.streamingLink} onChange={(e) => handleVersionChange(epIdx, vIdx, "streamingLink", e.target.value)}
                                                       className="flex-grow bg-white rounded-xl p-3 text-xs outline-none border border-gray-50 shadow-sm" />
                                                {ep.versions.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveVersion(epIdx, vIdx)} className="text-red-300 px-2">&times;</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-4 bg-[#195C51] text-white py-5 rounded-[2.5rem] font-bold hover:bg-[#0E3A32] shadow-2xl transition-all active:scale-95 disabled:opacity-50">
                        <MdPublish size={24}/> {submitting ? "Writing to Database..." : "Publish to Library"}
                    </button>
                </form>

                {/* RIGHT COLUMN: PREVIEW */}
                <div className="lg:col-span-5 sticky top-32 space-y-8 h-screen">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 px-4">Network Display Preview</h2>
                    
                    <div className="google-card overflow-hidden bg-[#0B121A] aspect-[2/3] relative rounded-[3.5rem] shadow-2xl group border-none">
                        <img 
                            src={form.poster || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059"} 
                            className="w-full h-full object-cover opacity-50 transition-transform duration-1000 group-hover:scale-105" 
                            alt="Poster" 
                        />
                        
                        <div className="absolute inset-0 p-12 flex flex-col justify-end bg-gradient-to-t from-[#0B121A] via-transparent to-transparent">
                            <div className="space-y-6">
                                <div className="flex gap-2">
                                    <span className="bg-[#195C51] text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                                        {form.movie_type}
                                    </span>
                                    <span className="bg-white/10 backdrop-blur-md text-white/80 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                                        {form.category || "Genre"}
                                    </span>
                                </div>
                                <h2 className="text-5xl font-bold text-white leading-tight">{form.title || "Untitled"}</h2>
                                <p className="text-gray-400 text-base font-light line-clamp-4 leading-relaxed italic">
                                    {form.description || "Awaiting story overview..."}
                                </p>
                                <div className="pt-6 flex gap-4">
                                    <div className="h-14 flex-grow bg-white rounded-2xl flex items-center justify-center text-black font-black text-xs uppercase tracking-[0.2em] shadow-lg">Start Stream</div>
                                    <div className="h-14 w-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">+</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Dynamic Trailer Hint */}
                    {form.trailer_url && (
                        <div className="google-card p-6 bg-white flex items-center gap-4 border-l-4 border-[#195C51]">
                            <MdOutlineSlowMotionVideo size={24} className="text-[#195C51]" />
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Trailer Link Active</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}