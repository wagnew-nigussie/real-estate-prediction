import { useState, useEffect } from 'react';
import { Home, Activity, Building, DollarSign, LogOut, Lock } from 'lucide-react';
import { predictPropertyPrice, loginUser, registerUser } from './services/api';

function App() {
  // --- STATE ---
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authData, setAuthData] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    longitude: -122.23, latitude: 37.88, housing_median_age: 41.0,
    total_rooms: 880.0, total_bedrooms: 129.0, population: 322.0,
    households: 126.0, median_income: 8.3252
  });

  // --- AUTHENTICATION LOGIC ---
  const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthData({ ...authData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      let response;
      if (isLoginMode) {
        response = await loginUser({ email: authData.email, password: authData.password });
      } else {
        response = await registerUser(authData);
      }
      
      if (response.status === 'success') {
        setToken(response.token);
        localStorage.setItem('token', response.token);
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.message || 'Authentication failed. Make sure backend is running.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setResult(null);
  };

  // --- PREDICTION LOGIC ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const handlePredictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);

    try {
      const response = await predictPropertyPrice(formData, token!);
      if (response.status === 'success') setResult(response.data.predictedPrice);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout(); // Token expired or invalid
      } else {
        setError("Failed to connect to the backend API.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER LOGIN SCREEN ---
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-600 p-3 rounded-full inline-block mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-gray-500 text-sm mt-2">Secure access to the Real Estate Predictor API</p>
          </div>
          
          {authError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 text-center">{authError}</div>}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" onChange={handleAuthChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" onChange={handleAuthChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" name="password" onChange={handleAuthChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
              {isLoginMode ? 'Sign In' : 'Register'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-sm text-blue-600 hover:underline">
              {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-full"><Home className="h-6 w-6 text-white" /></div>
            <h1 className="text-2xl font-bold text-gray-900">Real Estate Predictor</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center text-gray-500 hover:text-red-600 transition">
            <LogOut className="h-5 w-5 mr-1" /> Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 border-b md:border-b-0 md:border-r border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500"/> Property Details
              </h2>
              <form onSubmit={handlePredictSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-gray-500">Longitude</label><input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleInputChange} className="w-full rounded border p-2" required /></div>
                  <div><label className="block text-xs text-gray-500">Latitude</label><input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleInputChange} className="w-full rounded border p-2" required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-gray-500">Median Age</label><input type="number" step="any" name="housing_median_age" value={formData.housing_median_age} onChange={handleInputChange} className="w-full rounded border p-2" required /></div>
                  <div><label className="block text-xs text-gray-500">Median Income</label><input type="number" step="any" name="median_income" value={formData.median_income} onChange={handleInputChange} className="w-full rounded border p-2" required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-gray-500">Total Rooms</label><input type="number" step="any" name="total_rooms" value={formData.total_rooms} onChange={handleInputChange} className="w-full rounded border p-2" required /></div>
                  <div><label className="block text-xs text-gray-500">Total Bedrooms</label><input type="number" step="any" name="total_bedrooms" value={formData.total_bedrooms} onChange={handleInputChange} className="w-full rounded border p-2" required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-gray-500">Population</label><input type="number" step="any" name="population" value={formData.population} onChange={handleInputChange} className="w-full rounded border p-2" required /></div>
                  <div><label className="block text-xs text-gray-500">Households</label><input type="number" step="any" name="households" value={formData.households} onChange={handleInputChange} className="w-full rounded border p-2" required /></div>
                </div>
                <button type="submit" disabled={loading} className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400">
                  {loading ? 'Processing...' : 'Generate Prediction'}
                </button>
              </form>
            </div>

            <div className="p-8 bg-gray-50 flex flex-col justify-center items-center">
              {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg w-full text-center">{error}</div>}
              {!result && !error && !loading && (
                <div className="text-center text-gray-400">
                  <Building className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Awaiting property data...</p>
                </div>
              )}
              {loading && (
                <div className="text-center text-blue-500 animate-pulse">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                </div>
              )}
              {result !== null && !loading && (
                <div className="text-center w-full">
                  <div className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">Secure Prediction Successful</div>
                  <p className="text-gray-500 mb-1">Estimated Market Value</p>
                  <div className="text-4xl font-bold text-gray-900 flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-green-500 mr-1" />{result.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
