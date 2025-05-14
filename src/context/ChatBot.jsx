import React, { useEffect, useRef } from 'react';

const ChatBot = () => {
  const scriptRef = useRef(null);
  const chatInitializedRef = useRef(false);

  useEffect(() => {
    // Only initialize if not already done
    if (chatInitializedRef.current) return;

    const initializeChat = () => {
      if (window.voiceflow?.chat && !chatInitializedRef.current) {
        window.voiceflow.chat.load({
          verify: { projectID: '68202d1c6c9c534714a6b660' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          voice: {
            url: "https://runtime-api.voiceflow.com"
          }
        });
        chatInitializedRef.current = true;
      }
    };

    // Create script if it doesn't exist
    if (!scriptRef.current) {
      scriptRef.current = document.createElement('script');
      scriptRef.current.type = 'text/javascript';
      scriptRef.current.src = 'https://cdn.voiceflow.com/widget-next/bundle.mjs';
      scriptRef.current.async = true;
      scriptRef.current.onload = initializeChat;

      // Add script to document
      document.head.appendChild(scriptRef.current);
    } else {
      // If script exists but chat not initialized, try to initialize
      initializeChat();
    }

    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
      if (window.voiceflow?.chat && chatInitializedRef.current) {
        window.voiceflow.chat.destroy();
        chatInitializedRef.current = false;
      }
    };
  }, []);

  // Component doesn't render anything
  return null;
};

export default ChatBot;
