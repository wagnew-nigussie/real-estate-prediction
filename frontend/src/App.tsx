import { useState, useEffect } from 'react';
import { Home, Activity, Building, LogOut, Lock, Clock, BarChart2 } from 'lucide-react';
import { predictPropertyPrice, loginUser, registerUser, getPredictionHistory } from './services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authData, setAuthData] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    size_sqm: 150,
    property_type: 'apartment',
    subcity: 'bole',
    num_bedrooms: 3,
    num_bathrooms: 2,
    year: 2024
  });

  useEffect(() => {
    if (token) {
      getPredictionHistory(token)
        .then(res => { if (res.status === 'success') setHistory(res.data); })
        .catch(() => handleLogout());
    }
  }, [token]);

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
      setAuthError(err.response?.data?.message || 'Authentication failed.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setResult(null);
    setHistory([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handlePredictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const response = await predictPropertyPrice(formData, token!);
      if (response.status === 'success') {
        setResult(response.data.predictedPrice);
        getPredictionHistory(token!).then(res => {
          if (res.status === 'success') setHistory(res.data);
        });
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else {
        setError(err.response?.data?.message || "Failed to connect to the API.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-600 p-3 rounded-full inline-block mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-gray-500 text-sm mt-2">Secure access to the Addis Ababa Price Predictor</p>
          </div>
          {authError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 text-center">{authError}</div>}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" onChange={handleAuthChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" onChange={handleAuthChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" name="password" onChange={handleAuthChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
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

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-full"><Home className="h-6 w-6 text-white" /></div>
            <h1 className="text-2xl font-bold text-gray-900">Addis Ababa Price Predictor</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center text-gray-500 hover:text-red-600 transition">
            <LogOut className="h-5 w-5 mr-1" /> Logout
          </button>
        </div>

        {/* Main Prediction Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 border-b md:border-b-0 md:border-r border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500"/> Property Details
              </h2>
              <form onSubmit={handlePredictSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500">Size (sqm)</label>
                  <input type="number" step="any" name="size_sqm" value={formData.size_sqm} onChange={handleInputChange} className="w-full rounded border p-2" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500">Property Type</label>
                    <select name="property_type" value={formData.property_type} onChange={handleInputChange} className="w-full rounded border p-2">
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Subcity</label>
                    <select name="subcity" value={formData.subcity} onChange={handleInputChange} className="w-full rounded border p-2">
                      <option value="bole">Bole</option>
                      <option value="yeka">Yeka</option>
                      <option value="lemi kura">Lemi Kura</option>
                      <option value="kirkos">Kirkos</option>
                      <option value="nifas silk-lafto">Nifas Silk-Lafto</option>
                      <option value="akaki kality">Akaki Kality</option>
                      <option value="lideta">Lideta</option>
                      <option value="kolfe keranio">Kolfe Keranio</option>
                      <option value="arada">Arada</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500">Bedrooms</label>
                    <input type="number" name="num_bedrooms" value={formData.num_bedrooms} onChange={handleInputChange} className="w-full rounded border p-2" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Bathrooms</label>
                    <input type="number" name="num_bathrooms" value={formData.num_bathrooms} onChange={handleInputChange} className="w-full rounded border p-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Year Built / Listed</label>
                  <input type="number" name="year" value={formData.year} onChange={handleInputChange} className="w-full rounded border p-2" required />
                </div>
                <button type="submit" disabled={loading} className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400">
                  {loading ? 'Processing...' : 'Generate Prediction (ETB)'}
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
                    {result.toLocaleString()} <span className="text-2xl text-gray-500 ml-2">ETB</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart Section */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-blue-500"/> Price Trends
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...history].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="subcity" tickFormatter={(val) => val.substring(0, 5) + '...'} />
                  <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} ETB`, 'Price']} />
                  <Bar dataKey="predictedPriceEtb" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500"/> Prediction History
            </h2>
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No predictions yet. Generate one above!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size (sqm)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.sizeSqm}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.propertyType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.subcity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {item.predictedPriceEtb.toLocaleString()} ETB
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
