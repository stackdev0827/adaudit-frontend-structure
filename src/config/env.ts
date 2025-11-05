// Define the configuration structure
interface Config {
  SERVER_ADDRESS: string;
  // Add other config values here
}

// Validate and load environment variables
const getConfig = (): Config => {
  const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS;

  if (!SERVER_ADDRESS) {
    throw new Error('VITE_SERVER_ADDRESS is not defined in environment variables');
  }

  return {
    SERVER_ADDRESS,
  };
};

// Export a frozen config object to prevent modifications
export const config = Object.freeze(getConfig()); 