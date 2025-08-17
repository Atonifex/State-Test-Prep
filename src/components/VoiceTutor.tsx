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
  const buttonRef = useRef<HTMLDivElement>(null);
  
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

  // Enhanced send function that includes question context
  const sendWithContext = (text: string) => {
    // TODO: Later add user attempt history and previous answers for more personalized help
    const contextualMessage = `
QUESTION CONTEXT:
${questionContext}

STUDENT QUESTION: ${text}

Please provide a helpful, encouraging explanation focused on helping the student understand the concept, not just get the right answer. Keep your response to 2-3 sentences maximum.`;
    
    sendTextAndStartResponse(contextualMessage);
  };

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExpanded) return; // Don't drag when expanded
    
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
    
    // Keep button within viewport bounds
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

  // Handle expand/collapse
  const handleToggleExpanded = () => {
    if (!isExpanded && !state.connected) {
      // Auto-connect when expanding for the first time
      connect();
    }
    setIsExpanded(!isExpanded);
  };

  const handleClose = () => {
    setIsExpanded(false);
    // TODO: Later add option to auto-disconnect or keep connection alive based on user preference
  };

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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-center pt-8"
            style={{ zIndex: 1001 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-[80vw] max-w-4xl h-[40vh] bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👩‍🏫</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ivan - Your AI Tutor</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                        state.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {state.connected ? 'Connected' : 'Connecting...'}
                      </span>
                      {state.isServerListening && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">
                          <Mic className="w-3 h-3" />
                          Listening
                        </span>
                      )}
                      {state.isProcessing && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                          Processing...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
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
                      <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-600">Connecting to Ivan...</p>
                      <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Hint */}
              <div className="px-4 py-2 bg-gray-50 border-t">
                <p className="text-xs text-gray-600 text-center">
                  💡 Ask Ivan about this question, reading strategies, or grammar concepts. He's here to help you learn!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
