import { useState, useEffect } from 'react';

/**
 * A hook to dynamically load scripts
 * @param src - Script source URL
 * @param globalName - The name of the global variable to check for existence
 */
export function useLoader(src: string, globalName: string): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if the script is already loaded
    if (window[globalName as keyof Window]) {
      setLoaded(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    // Set onload handler
    script.onload = () => {
      setLoaded(true);
    };
    
    // Handle loading errors
    script.onerror = () => {
      console.error(`Failed to load script: ${src}`);
      document.body.removeChild(script);
    };
    
    // Add script to document body
    document.body.appendChild(script);
    
    // Cleanup function
    return () => {
      // Only remove the script if it hasn't loaded yet
      if (!loaded && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [src, globalName]);

  return loaded;
}
