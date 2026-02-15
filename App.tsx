
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { STOPS, TRANSITION_TIME_MS, STOP_WAIT_TIME_MS, MAX_CAPACITY } from './constants';
import { Ticket, Stop, AuthState, User } from './types';
import BusMap from './components/BusMap';
import { predictOccupancy } from './services/geminiService';
import { 
  Bus, 
  MapPin, 
  Users, 
  TrendingUp, 
  LogOut, 
  LogIn, 
  PlusCircle, 
  Trash2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  Search,
  Navigation,
  Lock
} from 'lucide-react';

const App: React.FC = () => {
  // Simulation State
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitTimeLeft, setWaitTimeLeft] = useState(0);
  
  // App State - Defaulting to LOGIN state to prioritize conductor entry
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [authState, setAuthState] = useState<AuthState>(AuthState.LOGIN);
  const [user, setUser] = useState<User | null>(null);
  
  // Prediction UI State
  const [predictBusName, setPredictBusName] = useState('Swift-Kerala Express');
  const [predictBoarding, setPredictBoarding] = useState(0);
  const [prediction, setPrediction] = useState<{count: number; reason: string} | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Form States (Conductor/Admin Dashboard)
  const [loginUser, setLoginUser] = useState('');
  const [newTicketBoarding, setNewTicketBoarding] = useState(0);
  const [newTicketDest, setNewTicketDest] = useState(1);
  const [newTicketCount, setNewTicketCount] = useState(1);

  // 1. Simulation Logic with 10s Halt
  useEffect(() => {
    let interval: any;
    
    if (!isWaiting) {
      interval = setInterval(() => {
        setProgress(prev => {
          const step = (100 / (TRANSITION_TIME_MS / 100)) / 100;
          const next = prev + step;
          if (next >= 1) {
            setIsWaiting(true);
            setWaitTimeLeft(STOP_WAIT_TIME_MS);
            return 1;
          }
          return next;
        });
      }, 100);
    } else {
      interval = setInterval(() => {
        setWaitTimeLeft(prev => {
          const next = prev - 100;
          if (next <= 0) {
            setIsWaiting(false);
            setCurrentStopIndex(curr => (curr + 1) % STOPS.length);
            setProgress(0);
            return 0;
          }
          return next;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isWaiting]);

  // Sync admin form boarding point with bus position
  useEffect(() => {
    setNewTicketBoarding(currentStopIndex);
    if (newTicketDest <= currentStopIndex) {
        setNewTicketDest(Math.min(currentStopIndex + 1, STOPS.length - 1));
    }
  }, [currentStopIndex]);

  // Ensure destination is always valid when boarding changes
  useEffect(() => {
    if (newTicketDest <= newTicketBoarding) {
      const nextValid = STOPS.find(s => s.id > newTicketBoarding);
      if (nextValid) {
        setNewTicketDest(nextValid.id);
      }
    }
  }, [newTicketBoarding]);

  // 2. Automated Passenger Removal
  useEffect(() => {
    if (progress === 0 && !isWaiting) {
      setTickets(prev => prev.filter(t => t.destinationIdx > currentStopIndex));
    }
  }, [currentStopIndex, progress, isWaiting]);

  // Calculated Stats
  const activeCount = useMemo(() => {
    return tickets
      .filter(t => t.boardingIdx <= currentStopIndex && t.destinationIdx > currentStopIndex)
      .reduce((acc, t) => acc + t.count, 0);
  }, [tickets, currentStopIndex]);

  const isFull = activeCount >= MAX_CAPACITY;

  // Handlers
  const handlePredict = async () => {
    setIsPredicting(true);
    const result = await predictOccupancy(
      predictBusName, 
      STOPS[predictBoarding], 
      tickets, 
      STOPS
    );
    setPrediction({ count: result.predictedCount, reason: result.reason });
    setIsPredicting(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser) return;
    setUser({ username: loginUser, busName: 'Swift-Kerala Express', isLoggedIn: true });
    setAuthState(AuthState.DASHBOARD);
  };

  const handleAdminIssue = () => {
    if (activeCount + newTicketCount > MAX_CAPACITY) {
      alert("Capacity Exceeded! Operation Blocked.");
      return;
    }
    if (newTicketBoarding >= newTicketDest) {
        alert("Destination must be after Boarding point!");
        return;
    }
    const newTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      busName: user?.busName || 'Admin Issued',
      boardingIdx: newTicketBoarding,
      destinationIdx: newTicketDest,
      count: newTicketCount,
      timestamp: Date.now()
    };
    setTickets(prev => [...prev, newTicket]);
    setNewTicketCount(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
              <Bus className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">SwiftRoute Staff</span>
          </div>

          <div className="flex items-center space-x-4">
            {user?.isLoggedIn && (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600 hidden md:inline">Conductor: <span className="text-gray-900 font-bold">{user.username}</span></span>
                <button 
                  onClick={() => { setUser(null); setAuthState(AuthState.LOGIN); }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-full"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Map & Status (Visible to all staff) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="relative group">
            <BusMap 
              currentStopIndex={currentStopIndex} 
              nextStopIndex={currentStopIndex >= STOPS.length - 1 ? 0 : currentStopIndex + 1}
              progress={progress} 
            />
            {isWaiting && (
              <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[2px] rounded-3xl flex items-center justify-center transition-all z-20">
                <div className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl flex flex-col items-center space-y-2 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 animate-pulse" />
                    <span className="text-xl">Halted at {STOPS[(currentStopIndex + 1) % STOPS.length].name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-orange-100">
                    <span className="text-sm uppercase tracking-widest text-center">Resuming in: {(waitTimeLeft / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-3">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl transition-colors duration-500 ${isFull ? 'bg-red-100' : 'bg-blue-100'}`}>
                  <Users className={`${isFull ? 'text-red-600' : 'text-blue-600'} w-6 h-6 transition-colors duration-500`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Onboard Capacity</p>
                  <p className={`text-2xl font-black transition-colors duration-500 ${isFull ? 'text-red-600' : 'text-gray-900'}`}>
                    {activeCount} <span className="text-sm font-normal text-gray-400">/ {MAX_CAPACITY}</span>
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ease-out ${isFull ? 'bg-red-500' : 'bg-blue-500'}`} 
                  style={{ width: `${(activeCount / MAX_CAPACITY) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <MapPin className="text-green-600 w-6 h-6" />
              </div>
              <div className="truncate">
                <p className="text-sm text-gray-500 font-medium">Location Status</p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {isWaiting ? `At ${STOPS[(currentStopIndex + 1) % STOPS.length].name}` : `Moving to ${STOPS[(currentStopIndex + 1) % STOPS.length].name}`}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className={`p-3 rounded-xl transition-colors ${isWaiting ? 'bg-orange-100' : 'bg-blue-100'}`}>
                {isWaiting ? <Clock className="text-orange-600 w-6 h-6" /> : <TrendingUp className="text-blue-600 w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Halt Status</p>
                <p className={`text-lg font-bold ${isWaiting ? 'text-orange-600' : 'text-gray-900'}`}>
                  {isWaiting ? "Boarding Now" : "In Transit"}
                </p>
              </div>
            </div>
          </div>

          {/* Prediction Tool */}
          <section className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="text-blue-400 w-6 h-6" />
              <h2 className="text-2xl font-bold">Occupancy Forecasting</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end relative z-10">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">Bus Name</label>
                  <input 
                    value={predictBusName}
                    onChange={(e) => setPredictBusName(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">Check for Stop</label>
                  <select 
                    value={predictBoarding}
                    onChange={(e) => setPredictBoarding(Number(e.target.value))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white"
                  >
                    {STOPS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="h-full">
                <button 
                  onClick={handlePredict}
                  disabled={isPredicting}
                  className="w-full h-[52px] bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 group"
                >
                  {isPredicting ? <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-5 h-5"></span> : <Search className="w-5 h-5" />}
                  <span>{isPredicting ? "Calculating..." : "Run AI Forecast"}</span>
                </button>
              </div>
            </div>

            {prediction && (
              <div className="mt-8 p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/10 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold">Forecast Results</h4>
                  <div className="text-right">
                    <span className="text-3xl font-black text-blue-400">{prediction.count}</span>
                    <span className="ml-1 text-sm font-medium">passengers</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm italic">"{prediction.reason}"</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Interaction */}
        <div className="lg:col-span-4 space-y-6">
          {authState === AuthState.LOGIN ? (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                 <Lock className="text-blue-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Staff Access</h2>
              <p className="text-gray-500 mb-8 text-sm">Please sign in to manage the passenger manifest and ticketing system.</p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Staff Identification</label>
                  <input 
                    required
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Enter Staff ID or Name"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-gray-200"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Authenticate</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Conductor Dashboard: Manual Issuance */}
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 relative">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="bg-blue-50 p-2 rounded-lg">
                      <PlusCircle className="text-blue-600 w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold">Manifest Update</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-1.5 flex items-center space-x-1">
                        <Navigation className="w-3 h-3" />
                        <span>Boarding From</span>
                    </label>
                    <select 
                      value={newTicketBoarding}
                      onChange={(e) => setNewTicketBoarding(Number(e.target.value))}
                      className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      {STOPS.filter(s => s.id >= currentStopIndex).map(s => (
                        <option key={s.id} value={s.id}>
                          {s.id === currentStopIndex ? '📍 ' : ''}{s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-1.5 flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>Dropping At</span>
                    </label>
                    <select 
                      value={newTicketDest}
                      onChange={(e) => setNewTicketDest(Number(e.target.value))}
                      className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      {STOPS.filter(s => s.id > newTicketBoarding).map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-1.5 block">Quantity</label>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => setNewTicketCount(Math.max(1, newTicketCount - 1))} className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl font-bold text-xl transition-colors">-</button>
                      <div className="flex-1 bg-white border border-gray-100 h-12 flex items-center justify-center rounded-xl font-black text-2xl text-blue-600 shadow-inner">
                        {newTicketCount}
                      </div>
                      <button onClick={() => setNewTicketCount(newTicketCount + 1)} className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl font-bold text-xl transition-colors">+</button>
                    </div>
                  </div>

                  <button 
                    onClick={handleAdminIssue}
                    disabled={activeCount + newTicketCount > MAX_CAPACITY}
                    className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center space-x-2 shadow-lg ${
                      activeCount + newTicketCount > MAX_CAPACITY ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>{activeCount + newTicketCount > MAX_CAPACITY ? "Full Capacity" : "Issue & Onboard"}</span>
                  </button>
                </div>
              </div>

              {/* Onboard Registry */}
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 h-[360px] flex flex-col">
                <h3 className="text-lg font-bold mb-5 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span>Manifest List</span>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full ${isFull ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      {activeCount} / 55
                  </span>
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {tickets.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-40">
                      <Users className="w-8 h-8 mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No Active Entries</p>
                    </div>
                  ) : (
                    tickets.map(ticket => (
                      <div key={ticket.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-blue-200 hover:bg-white transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center font-black text-blue-600 border border-gray-100 shadow-sm">
                            {ticket.count}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter truncate w-16">{STOPS[ticket.boardingIdx].name}</span>
                              <ArrowRight className="w-2.5 h-2.5 text-blue-300" />
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter truncate w-16">{STOPS[ticket.destinationIdx].name}</span>
                            </div>
                            <p className="text-[8px] text-gray-400 italic">#{ticket.id.toUpperCase()}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setTickets(prev => prev.filter(t => t.id !== ticket.id))}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {tickets.length > 0 && (
                   <div className="pt-3 border-t border-gray-100 mt-2">
                       <p className="text-[10px] text-gray-400 italic">Manifest automatically updates based on bus position.</p>
                   </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 text-center mt-8">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">© 2024 SwiftRoute Intelligent Staff Portal</p>
      </footer>
    </div>
  );
};

export default App;
