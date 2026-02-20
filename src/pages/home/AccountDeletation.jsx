import  { useState } from 'react';

function AccountDeletion() {
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Open email client with pre-filled email
    window.location.href = `mailto:rw.byose@gmail.com?subject=Account Deletion Request&body=Please delete my PresenceEye account. Contact: ${contact}`;
    setSubmitted(true);
  };

  return (
    <div className="flex items-center justify-center  p-4">
      <div className="rounded-xl shadow-lg p-6 w-full max-w-md transition-transform transform hover:scale-105">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Request Account Deletion
        </h2>
        <p className="text-gray-600 text-sm text-center mb-6">
          Enter your email or phone number associated with your PresenceEye account.
          You will then be able to submit a request to delete your account and all associated data.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Email or Phone Number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              className="px-4 py-3 border bg-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#195C51] focus:border-[#195C51] transition"
            />

            <button
              type="submit"
              className="bg-[#195C51] text-white font-semibold py-3 rounded-lg hover:bg-[#15473f] transition shadow-sm hover:shadow-md"
            >
              Submit Request
            </button>
          </form>
        ) : (
          <p className="text-[#195C51] font-medium text-center">
            Your request has been prepared. Please check your email client to send the request to our support team.
          </p>
        )}

        <p className="text-gray-500 text-xs mt-6 text-center">
          Alternatively, you can directly email{' '}
          <a href="mailto:rw.byose@gmail.com" className="text-[#195C51] underline">
            rw.byose@gmail.com
          </a>{' '}
          with the subject "Account Deletion Request".
        </p>
      </div>
    </div>
  );
}

export default AccountDeletion;
