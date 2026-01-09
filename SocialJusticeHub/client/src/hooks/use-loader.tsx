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

    // Check if script is already in the DOM
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      // Script is already in DOM, wait for it to load
      const checkInterval = setInterval(() => {
        if (window[globalName as keyof Window]) {
          setLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      
      return () => clearInterval(checkInterval);
    }

    // Create script element
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    // Set onload handler
    script.onload = () => {
      // Double check that the global is available
      if (window[globalName as keyof Window]) {
        setLoaded(true);
      } else {
        console.warn(`Script loaded but global ${globalName} not found`);
      }
    };
    
    // Handle loading errors
    script.onerror = () => {
      console.error(`Failed to load script: ${src}`);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
    
    // Add script to document head (better practice than body)
    document.head.appendChild(script);
    
    // Cleanup function
    return () => {
      // Don't remove script on cleanup - it should persist
      // Only remove if there was an error
    };
  }, [src, globalName]);

  return loaded;
}
