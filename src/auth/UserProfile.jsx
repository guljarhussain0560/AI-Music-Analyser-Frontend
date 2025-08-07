import React, { useState, useEffect } from 'react';
import { fetchCurrentUser } from '../api/api.js'; // Adjust the path if necessary

// --- 1. New Reusable Avatar Component ---
// This component centralizes the logic for displaying a profile picture 
// or a fallback initial, and handles image loading errors gracefully.

const Avatar = ({ src, name, className }) => {
    // Determine the fallback initial from the user's name
    const fallbackInitial = name ? name.charAt(0).toUpperCase() : '👤';

    // State to track if the image source has an error
    const [hasError, setHasError] = useState(false);

    // Reset error state if the src changes
    useEffect(() => {
        setHasError(false);
    }, [src]);

    // If a src is provided and it hasn't failed, try to render the image
    if (src && !hasError) {
        return (
            <img 
                src={src} 
                alt={name || 'Profile'} 
                className={className} 
                // If the image fails to load, set the error state
                onError={() => setHasError(true)} 
            />
        );
    }

    // Otherwise, render the fallback with the user's initial
    return (
        <span className="text-2xl font-bold leading-none">{fallbackInitial}</span>
    );
};


// --- 2. Updated ProfileCard Component ---
// This component is now cleaner, as it uses the new Avatar component.

const ProfileCard = ({ onClose, user }) => {
    const renderContent = () => {
        if (!user) {
            return (
                <div className="text-center text-red-400 p-8">
                    <p>User data is not available.</p>
                </div>
            );
        }

        return (
            <>
                {/* Avatar Section */}
                <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-purple-600 text-white text-4xl font-bold overflow-hidden">
                        <Avatar 
                            src={user.profile_picture_url}
                            name={user.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* User Name and Email */}
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-white">{user.name || 'N/A'}</h2>
                    <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                
                <hr className="border-gray-600 my-6" />

                {/* Details Section */}
                <div className="text-left w-full px-2">
                    <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="text-sm font-medium text-gray-400">Name</span>
                        <span className="text-sm text-white">{user.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="text-sm font-medium text-gray-400">Email</span>
                        <span className="text-sm text-white">{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                        <span className="text-sm font-medium text-gray-400">Username</span>
                        <span className="text-sm text-white">{user.username || 'N/A'}</span>
                    </div>
                </div>
                
                {/* Close Button */}
                <div className="mt-8 text-center">
                    <button 
                        onClick={onClose}
                        className="bg-blue-500 hover:bg-blue-900 text-white text-sm font-medium py-2 px-6 rounded-full transition-colors duration-200"
                    >
                        Close
                    </button>
                </div>
            </>
        );
    };

    return (
        <div className="bg-gray-800 text-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative transform transition-all duration-300 ease-in-out">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                aria-label="Close Profile"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            {renderContent()}
        </div>
    );
};


// --- 3. Main App Component with Updated ProfileButton ---

export default function App() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userData = await fetchCurrentUser();
                setUser(userData);
            } catch (err) {
                setError("Could not fetch profile. Your session might have expired.");
            } finally {
                setLoading(false);
            }
        };
        loadUserData();
    }, []);

    const ProfileButton = () => {
        if (loading) {
            return (
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
            );
        }
        if (error || !user) {
             return (
                <button 
                    onClick={() => setIsPopupOpen(true)} 
                    className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-200"
                    aria-label="Open Profile Error"
                >
                    !
                </button>
            );
        }
        return (
            <button 
                onClick={() => setIsPopupOpen(true)} 
                className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 overflow-hidden"
                aria-label="Open Profile"
            >
                <Avatar 
                    src={user.profile_picture_url}
                    name={user.name}
                    className="w-full h-full object-cover"
                />
            </button>
        );
    };

    return (
        <div className=" min-h-screen w-full p-4">
            {/* Example placement of the profile button */}
            <div className="flex justify-end">
                <ProfileButton />
            </div>

            {isPopupOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300"
                    onClick={() => setIsPopupOpen(false)}
                >
                    <div onClick={e => e.stopPropagation()}>
                        {loading ? (
                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                        ) : (
                            <ProfileCard onClose={() => setIsPopupOpen(false)} user={user} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}