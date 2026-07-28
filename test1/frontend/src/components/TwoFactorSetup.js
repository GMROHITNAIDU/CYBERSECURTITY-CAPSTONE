import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Shield, 
  Smartphone, 
  QrCode, 
  Key, 
  CheckCircle, 
  XCircle,
  Loader2,
  AlertCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const TwoFactorSetup = ({ isOpen, onClose, onComplete }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isOpen && !user?.two_factor_enabled) {
      setupTwoFactor();
    }
  }, [isOpen, user]);

  const setupTwoFactor = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/setup-2fa', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setSecret(response.data.secret);
      setQrCodeData(response.data.qr_code);
      setStep(1);
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast.error('Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/auth/verify-2fa', 
        new URLSearchParams({ code: verificationCode }),
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      toast.success('Two-factor authentication enabled successfully!');
      setStep(3);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast.error('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/auth/disable-2fa', 
        new URLSearchParams({ password }),
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      toast.success('Two-factor authentication disabled');
      onClose();
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Invalid password or failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success('Secret copied to clipboard');
  };

  if (!isOpen) return null;

  // If 2FA is already enabled, show disable option
  if (user?.two_factor_enabled) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Two-Factor Authentication
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircle size={20} />
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              2FA is Enabled
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your account is protected with two-factor authentication.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter your password to disable 2FA
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Current password"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={disableTwoFactor}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Disable 2FA'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Setup Two-Factor Authentication
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XCircle size={20} />
          </button>
        </div>

        {loading && !qrCodeData ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Setting up 2FA...</p>
          </div>
        ) : step === 1 ? (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Scan QR Code
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Use your authenticator app (Google Authenticator, Authy, etc.) to scan this QR code.
              </p>
            </div>

            {qrCodeData && (
              <div className="text-center mb-6">
                <img 
                  src={qrCodeData} 
                  alt="2FA QR Code" 
                  className="mx-auto border rounded-lg p-2 bg-white"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Or enter this secret manually:
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md text-sm font-mono">
                  {showSecret ? secret : '••••••••••••••••'}
                </code>
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                  onClick={copySecret}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        ) : step === 2 ? (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Enter Verification Code
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Enter the 6-digit code from your authenticator app.
              </p>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center text-lg font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Back
              </button>
              <button
                onClick={verifyAndEnable}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Enable 2FA'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              2FA Enabled Successfully!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your account is now protected with two-factor authentication.
            </p>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Important: Save your backup codes
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Store your authenticator app backup in a safe place. You'll need it to recover your account if you lose your device.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;