"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Move, Mic, MicOff } from "lucide-react";
import { useRealtime } from "@/app/hooks/use-realtime";
import { Chat } from "./Chat";

interface VoiceTutorProps {
  questionContext: string;
}

export function VoiceTutor({ questionContext }: VoiceTutorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null);
  const [showDisconnectWarning, setShowDisconnectWarning] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(4);
  const [modalSize, setModalSize] = useState({ width: 80, height: 40 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // TODO: Later add option to change tutor persona - currently hardcoded to "english-ii-tutor"
  const { 
    state, 
    connect, 
    disconnect, 
    onTextDelta, 
    onCompleted, 
    onUserTextDelta, 
    onUserCompleted,
    sendTextAndStartResponse,
    createResponseNow,
    setAudioElement 
  } = useRealtime("english-ii-tutor");

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      setAudioElement(audioRef.current);
    }
  }, [setAudioElement]);

  // Auto-disconnect logic (now full disconnect)
  const resetInactivityTimer = () => {
    // Clear existing timers
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    if (warningTimer) {
      clearTimeout(warningTimer);
    }
    setShowDisconnectWarning(false);
    setWarningCountdown(4);
    
    // Set warning at 4 seconds, disconnect at 10 seconds
    const newWarningTimer = setTimeout(() => {
      setShowDisconnectWarning(true);
      setWarningCountdown(4);
      
      // Start countdown
      let countdown = 4;
      const countdownInterval = setInterval(() => {
        countdown--;
        setWarningCountdown(countdown);
        if (countdown <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
    }, 6000); // 6 seconds
    
    const disconnectTimer = setTimeout(() => {
      handleMicToggle(); // Full disconnect
    }, 10000); // 10 seconds total
    
    setWarningTimer(newWarningTimer);
    setInactivityTimer(disconnectTimer);
  };

  // Reset timer on any voice activity
  useEffect(() => {
    if (state.connected && (state.isServerListening || state.isProcessing)) {
      resetInactivityTimer();
    }
  }, [state.isServerListening, state.isProcessing]);

  // Full disconnect/connect toggle
  const handleMicToggle = () => {
    if (state.connected) {
      disconnect();
    } else {
      connect();
      resetInactivityTimer();
    }
    setShowDisconnectWarning(false);
    setWarningCountdown(4);
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      setInactivityTimer(null);
    }
    if (warningTimer) {
      clearTimeout(warningTimer);
      setWarningTimer(null);
    }
  };

  const sendWithContext = (text: string) => {
    resetInactivityTimer(); // Reset timer on user interaction
    
    const contextualMessage = `
QUESTION CONTEXT: ${questionContext}

STUDENT QUESTION: ${text}

Please provide a helpful, encouraging explanation focused on helping the student understand the concept. Ask guiding questions to help the student think through the problem. If they ask for the answer, you can give it. Keep your response to 2-3 sentences maximum, and be fun, engaging, encouraging, and humorous.`;
    
    sendTextAndStartResponse(contextualMessage);
  };

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExpanded) return;
    setIsDragging(true);
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isExpanded) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Modal resize handlers
  const handleResizeStart = (handle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !resizeHandle || !modalRef.current) return;
    
    const rect = modalRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    let newWidth = modalSize.width;
    let newHeight = modalSize.height;
    
    if (resizeHandle.includes('right')) {
      newWidth = Math.min(95, Math.max(40, (e.clientX / vw) * 100));
    }
    if (resizeHandle.includes('bottom')) {
      newHeight = Math.min(80, Math.max(20, ((e.clientY - rect.top + rect.height) / vh) * 100));
    }
    
    setModalSize({ width: newWidth, height: newHeight });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeHandle(null);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, resizeHandle, modalSize]);

  const handleToggleExpanded = () => {
    if (!isExpanded && !state.connected) {
      connect();
      resetInactivityTimer();
    }
    setIsExpanded(!isExpanded);
  };

  const handleClose = () => {
    setIsExpanded(false);
    // Full disconnect on close
    if (state.connected) {
      disconnect();
    }
    // Clear all timers
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      setInactivityTimer(null);
    }
    if (warningTimer) {
      clearTimeout(warningTimer);
      setWarningTimer(null);
    }
    setShowDisconnectWarning(false);
    setWarningCountdown(4);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      if (warningTimer) {
        clearTimeout(warningTimer);
      }
    };
  }, [inactivityTimer, warningTimer]);

  return (
    <>
      {/* Hidden audio element for voice output */}
      <audio ref={audioRef} autoPlay className="hidden" />
      
      {/* Floating Button */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            ref={buttonRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              zIndex: 1000
            }}
            className={`cursor-${isDragging ? 'grabbing' : 'grab'}`}
            onMouseDown={handleMouseDown}
          >
            <button
              onClick={handleToggleExpanded}
              className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
              title="Ask Ivan (Your AI Tutor)"
            >
              {state.connected && (state.isServerListening || state.isProcessing) ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Mic className="w-6 h-6" />
                </motion.div>
              ) : (
                <MessageCircle className="w-6 h-6" />
              )}
              
              {/* Status indicator */}
              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                state.connected ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </button>
            
            {/* Drag hint */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                <Move className="w-3 h-3 inline mr-1" />
                Drag to move
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 z-50 flex items-start justify-center pt-8"
            style={{ zIndex: 1001 }}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0, y: -50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col relative"
              style={{ 
                width: `${modalSize.width}vw`, 
                height: `${modalSize.height}vh`,
                maxWidth: '95vw',
                maxHeight: '80vh',
                minWidth: '40vw',
                minHeight: '20vh'
              }}
            >
              {/* Resize Handles */}
              <div 
                className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-blue-200 opacity-0 hover:opacity-50 transition-opacity"
                onMouseDown={(e) => handleResizeStart('right', e)}
              />
              <div 
                className="absolute left-0 right-0 bottom-0 h-2 cursor-s-resize hover:bg-blue-200 opacity-0 hover:opacity-50 transition-opacity"
                onMouseDown={(e) => handleResizeStart('bottom', e)}
              />
              <div 
                className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize hover:bg-blue-200 opacity-0 hover:opacity-50 transition-opacity"
                onMouseDown={(e) => handleResizeStart('right-bottom', e)}
              />

              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👩‍🏫</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ivan - Your AI Tutor</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                        state.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {state.connected ? 'Connected' : 'Disconnected'}
                      </span>
                      
                      {/* Status Indicator */}
                      {state.connected && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                          state.isServerListening ? 'bg-amber-100 text-amber-700' : 
                          state.isProcessing ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {state.isServerListening ? (
                            <>
                              <Mic className="w-3 h-3" />
                              Listening
                            </>
                          ) : state.isProcessing ? (
                            'Processing...'
                          ) : (
                            'Ready'
                          )}
                        </span>
                      )}
                      
                      {/* Warning Countdown */}
                      {showDisconnectWarning && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 animate-pulse">
                          Disconnecting in {warningCountdown}s
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Mic Toggle Button */}
                  <button
                    onClick={handleMicToggle}
                    className={`p-2 rounded-full transition-colors ${
                      state.connected 
                        ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                        : 'bg-green-100 hover:bg-green-200 text-green-600'
                    }`}
                    title={state.connected ? "Disconnect Voice Chat" : "Connect Voice Chat"}
                  >
                    {state.connected ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  
                  {/* Close Modal Button */}
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-full transition-colors"
                    style={{ backgroundColor: '#f16522', color: 'white' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#f16522';
                      e.currentTarget.style.border = '2px solid #f16522';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f16522';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.border = 'none';
                    }}
                    title="Close Chat"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat Content */}
              <div className="flex-1 p-4 overflow-hidden">
                {state.connected ? (
                  <Chat
                    personaName="Ivan"
                    connected={state.connected}
                    sendText={sendWithContext}
                    onTextDelta={onTextDelta}
                    onCompleted={onCompleted}
                    onUserTextDelta={onUserTextDelta}
                    onUserCompleted={onUserCompleted}
                    createResponseNow={createResponseNow}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <button
                        onClick={() => {
                          connect();
                          resetInactivityTimer();
                        }}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <Mic className="w-5 h-5" />
                        Start Voice Chat
                      </button>
                      <p className="text-sm text-gray-500 mt-4">Click to connect and start talking with Ivan</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-gray-50 border-t flex-shrink-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">
                    💡 Ask about this question, reading strategies, or grammar concepts
                  </p>
                  {state.connected && (
                    <p className="text-xs text-gray-500">
                      Auto-disconnect after 10s of inactivity
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
