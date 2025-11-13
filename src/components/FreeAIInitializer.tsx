import React, { useEffect, useState } from 'react';
import { freeNotesGenerationService } from '@/services/freeNotesGenerationService';

interface FreeAIInitializerProps {
  children: React.ReactNode;
}

export const FreeAIInitializer: React.FC<FreeAIInitializerProps> = ({ children }) => {
  const [initializationStatus, setInitializationStatus] = useState<'initializing' | 'success' | 'failed'>('initializing');
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Initialize in the background without blocking the UI
    const initializeSystem = async () => {
      try {
        console.log('🚀 Initializing FREE AI Notes Generation System in background...');
        
        // Initialize with a very short timeout and don't block UI
        const initPromise = freeNotesGenerationService.initialize();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Background initialization timeout')), 3000) // Reduced to 3 seconds
        );
        
        await Promise.race([initPromise, timeoutPromise]);
        
        setInitializationStatus('success');
        setShowNotification(true);
        console.log('✅ FREE AI system initialized successfully in background');
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      } catch (error) {
        console.warn('⚠️ Background AI initialization failed, app will use fallbacks:', error);
        setInitializationStatus('failed');
        // Don't show error to user, just continue with fallbacks
      }
    };

    // Start initialization but don't wait for it
    initializeSystem();
  }, []);

  // Always render children immediately - no loading screen
  return (
    <>
      {children}
      
      {/* Optional: Show a subtle notification about AI status */}
      {showNotification && initializationStatus === 'success' && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right duration-500">
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg shadow-lg text-sm">
            ✅ AI System Ready
          </div>
        </div>
      )}
    </>
  );
};
