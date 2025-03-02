import { FcGoogle } from "react-icons/fc";

interface GoogleAuthButtonProps {
  action: 'signin' | 'signup'; // Action can either be 'signin' or 'signup'
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ action }) => {

    const buttonText = action === 'signin' ? 'Sign In with Google' : 'Sign Up with Google';

    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

    const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || '';

    // Async function for handling the Google authentication process
    const handleClick = async () => {
        try {

        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent("openid email profile")}&prompt=consent&access_type=offline`;

        // Get the screen width and height
        const width = 600;
        const height = 550;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        // Open the popup window at the calculated position
        const popup = window.open(
            url,
            "_blank",
            `width=${width},height=${height},left=${left},top=${top}`
        );

        // Polling to check if the popup is closed and checking for the token in the URL
        const checkPopupClosed = setInterval(() => {
            if (popup && popup.closed) {
            clearInterval(checkPopupClosed);
            // If you had any other cleanup to do, this is where you'd handle it
            }
        }, 1000);

        } catch (error) {
        console.error(`Error during ${action} process:`, error);
        }
    };

    return (
        <button
        onClick={handleClick} // Using the async handleClick function
        className={`flex items-center justify-center gap-x-2 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-gray-600 ${
            action === 'signup' ? 'w-auto' : 'w-full' // Adjust width based on action
        }`}
        aria-label={buttonText} // Added accessibility label for better screen reader support
        >
        <FcGoogle />
        <span>{buttonText}</span>
        </button>
    );
};

export default GoogleAuthButton;