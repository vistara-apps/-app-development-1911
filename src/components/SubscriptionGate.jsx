import React, { useState } from 'react';
import { Crown, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePaymentContext } from '../hooks/usePaymentContext';

function SubscriptionGate({ children }) {
  const { isSubscribed, subscribe } = useAuth();
  const { createSession } = usePaymentContext();
  const [loading, setLoading] = useState(false);

  // For now, allow free access to all features (freemium model)
  return children;

  // Uncomment below to re-enable subscription gate
  /*
  if (isSubscribed) {
    return children;
  }
  */

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await createSession();
      subscribe();
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Unlock Premium Features
        </h1>
        <p className="text-lg text-gray-600">
          Subscribe to access advanced wallet monitoring and analytics
        </p>
      </div>

      <div className="card max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro Plan</h2>
          <div className="text-3xl font-bold text-blue-600">$9.99 <span className="text-lg text-gray-600">/month</span></div>
        </div>

        <ul className="space-y-3 mb-6">
          <li className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-500" />
            <span>Unlimited wallet tracking</span>
          </li>
          <li className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-500" />
            <span>Real-time transfer alerts</span>
          </li>
          <li className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-500" />
            <span>Advanced portfolio analytics</span>
          </li>
          <li className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-500" />
            <span>Historical transaction analysis</span>
          </li>
          <li className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-500" />
            <span>Email notifications</span>
          </li>
        </ul>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="btn-primary w-full text-lg py-3 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Subscribe Now'}
        </button>

        <p className="text-sm text-gray-600 text-center mt-4">
          Connect your wallet to complete the subscription
        </p>
      </div>
    </div>
  );
}

export default SubscriptionGate;
