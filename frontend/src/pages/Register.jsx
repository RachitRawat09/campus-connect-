import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaUniversity, FaUpload } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext.jsx';
import { register as registerApi, verifyOTP, resendOTP } from '../api/auth.jsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    password: '',
    confirmPassword: '',
    studentIdFile: null,
  });
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        studentIdFile: e.target.files[0],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!formData.name || !formData.email || !formData.college || !formData.password) {
      setError('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }
    // Validate college email - support various college domains
    const collegeEmailDomains = [
      '.edu', '.edu.in', '.ac.in', '.ac.uk', '.edu.au', '.edu.ca', 
      '.edu.sg', '.edu.my', '.edu.ph', '.edu.nz', '.edu.za',
      '.university', '.college', '.institute', '.ac.za', '.edu.pk',
      '.edu.bd', '.edu.lk', '.edu.np', '.edu.bt', '.edu.mv'
    ];
    
    const isValidCollegeEmail = collegeEmailDomains.some(domain => 
      formData.email.toLowerCase().endsWith(domain.toLowerCase())
    );
    
    if (!isValidCollegeEmail) {
      setError('Please use a valid college/university email address (.edu, .ac.in, .edu.in, etc.)');
      toast.error('Please use a valid college/university email address (.edu, .ac.in, .edu.in, etc.)');
      setLoading(false);
      return;
    }
    
    // Prepare form data for API
    const apiData = {
      name: formData.name,
      email: formData.email,
      college: formData.college,
      password: formData.password,
    };
    
    try {
      const res = await registerApi(apiData);
      if (res.userId) {
        setUserId(res.userId);
        setShowOTPForm(true);
        toast.success('Registration successful! Please check your email for verification OTP.');
        
        // If OTP is included in response (for testing), show it
        if (res.otp) {
          console.log('OTP for testing:', res.otp);
          toast.info(`OTP for testing: ${res.otp}`);
        }
      } else {
        setError(res.message || 'Registration failed');
        toast.error(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!otp) {
      setError('Please enter the OTP');
      toast.error('Please enter the OTP');
      setLoading(false);
      return;
    }
    
    try {
      const res = await verifyOTP(userId, otp);
      if (res.message) {
        toast.success('Email verified successfully! You can now login.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const res = await resendOTP(userId);
      toast.success('OTP sent successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {!showOTPForm ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                College Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="you@college.ac.in"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="college"
                className="block text-sm font-medium text-gray-700"
              >
                College/University
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUniversity className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="college"
                  name="college"
                  type="text"
                  required
                  value={formData.college}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="University Name"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="studentId"
                className="block text-sm font-medium text-gray-700"
              >
                Upload Student ID (Optional)
              </label>
              <div className="mt-1 flex items-center">
                <label className="w-full flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                  <div className="space-y-1 text-center">
                    <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <span>Upload a file</span>
                      <input
                        id="studentId"
                        name="studentId"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>
                </label>
              </div>
              {formData.studentIdFile && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected file: {formData.studentIdFile.name}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Email Verification</h3>
                <p className="text-sm text-gray-600">
                  We've sent a 6-digit verification code to <strong>{formData.email}</strong>
                </p>
              </div>
              
              <form onSubmit={handleOTPSubmit} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength="6"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-lg tracking-widest"
                    placeholder="000000"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Resend OTP'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register; 