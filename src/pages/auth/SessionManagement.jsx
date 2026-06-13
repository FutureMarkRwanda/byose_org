import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { presence_server } from '../../config/server_api.js';
import { 
  fetchSessions, 
  removeSession, 
  markDeviceAsLost, 
  clearDeviceManagementToken,
  getSessionLimitInfo 
} from '../../utils/helper.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import { 
  MdArrowBack, 
  MdDevices, 
  MdDeleteOutline, 
  MdShield, 
  MdRefresh,
  MdWarning
} from 'react-icons/md';

export function SessionManagement() {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingSession, setRemovingSession] = useState(null);
  const [sessionLimitInfo, setSessionLimitInfo] = useState(null);

  useEffect(() => {
    const limitInfo = getSessionLimitInfo();
    setSessionLimitInfo(limitInfo);
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const result = await fetchSessions(presence_server);
    if (result.error) {
      showNotification(result.error, 'error');
      if (result.error.includes('No device management token')) {
        navigate('/auth/sign-in');
      }
    } else {
      setSessions(result.data.sessions || []);
    }
    setLoading(false);
  };

  const handleRemoveSession = async (sessionId) => {
    if (!confirm('Are you sure you want to remove this session?')) return;

    setRemovingSession(sessionId);
    const result = await removeSession(presence_server, sessionId);
    setRemovingSession(null);

    if (result.error) {
      showNotification(result.error, 'error');
    } else {
      showNotification('Session removed successfully', 'success');
      await loadSessions();
    }
  };

  const handleMarkAsLost = async (sessionId) => {
    if (!confirm('Are you sure you want to mark this device as lost? This will terminate the session.')) return;

    setRemovingSession(sessionId);
    const result = await markDeviceAsLost(presence_server, sessionId);
    setRemovingSession(null);

    if (result.error) {
      showNotification(result.error, 'error');
    } else {
      showNotification('Device marked as lost and session terminated', 'success');
      await loadSessions();
    }
  };

  const handleRetryLogin = () => {
    clearDeviceManagementToken();
    navigate('/auth/sign-in');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <section className="min-h-screen bg-[#F8F9FA] grid lg:grid-cols-12 selection:bg-[#195C51]/20">
      
      {/* LEFT PANEL: BRAND & CONTEXT */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#0B121A] relative overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#195C51 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>
        
        <div className="relative z-10">
          <Link to="/auth/sign-in" className="flex items-center gap-3 text-white group">
            <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:bg-[#195C51] transition-all">
                <MdArrowBack size={20}/>
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">Back to Login</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <img src="/assets/icons/Logo03.svg" className="h-16 w-16" alt="BYOSE Logo" />
          <h1 className="text-5xl font-bold text-white leading-tight tracking-tighter">
            Session <br/> <span className="text-[#195C51]">Management.</span>
          </h1>
          <p className="text-gray-400 text-lg font-light leading-relaxed max-w-sm">
            Manage your active PresenceEye sessions. Remove old sessions to free up space for new logins.
          </p>
        </div>

        <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600">
                Secure Terminal v2.4.0
            </p>
        </div>
      </div>

      {/* RIGHT PANEL: SESSION MANAGEMENT */}
      <div className="col-span-12 lg:col-span-7 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-4xl space-y-8 animate-slide-up">
          
          {/* Session Limit Warning */}
          {sessionLimitInfo && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <MdWarning className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-bold text-amber-800">Session Limit Reached</h3>
                  <p className="text-amber-700 text-sm mt-1">
                    You have {sessionLimitInfo.currentSessions} active sessions out of {sessionLimitInfo.maxSessions} allowed. 
                    Please remove some sessions to continue.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold text-[#333333]">Active Sessions</h2>
            <p className="text-gray-500 font-medium">Manage your device sessions</p>
          </div>

          {/* Sessions List */}
          <div className="bg-white border-none shadow-2xl rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MdDevices className="text-[#195C51]" size={24} />
                <span className="font-bold text-gray-800">
                  {sessions.length} Active Session{sessions.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={loadSessions}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <MdRefresh className={loading ? 'animate-spin' : ''} size={20} />
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#195C51] mx-auto mb-4"></div>
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <MdDevices className="mx-auto mb-4 text-gray-300" size={48} />
                <p>No active sessions found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {sessions.map((session) => (
                  <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-800 truncate">
                            {session.deviceInfo?.deviceName || 'Unknown Device'}
                          </span>
                          {session.isLost && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                              LOST
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-500">
                          <p>
                            <span className="font-medium">Device:</span> {session.deviceInfo?.platform || 'Unknown'}
                          </p>
                          <p>
                            <span className="font-medium">Last Activity:</span> {formatDate(session.lastActivityAt)}
                          </p>
                          <p>
                            <span className="font-medium">Created:</span> {formatDate(session.createdAt)}
                          </p>
                          {session.sharedBy && (
                            <p>
                              <span className="font-medium">Shared By:</span> {session.sharedBy}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {!session.isLost && (
                          <>
                            <button
                              onClick={() => handleRemoveSession(session.id)}
                              disabled={removingSession === session.id}
                              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 text-sm font-medium"
                            >
                              <MdDeleteOutline size={16} />
                              {removingSession === session.id ? 'Removing...' : 'Remove'}
                            </button>
                            <button
                              onClick={() => handleMarkAsLost(session.id)}
                              disabled={removingSession === session.id}
                              className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50 text-sm font-medium"
                            >
                              <MdShield size={16} />
                              Mark Lost
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Retry Login Button */}
          <button
            onClick={handleRetryLogin}
            className="w-full py-4 bg-[#195C51] text-white rounded-2xl font-bold text-sm tracking-widest shadow-xl hover:bg-[#0E3A32] transition-all active:scale-95"
          >
            Done - Retry Login
          </button>

          <p className="text-center text-xs text-gray-400 font-medium italic">
            "Security is not a product, but a process."
          </p>
        </div>
      </div>
    </section>
  );
}

export default SessionManagement;
