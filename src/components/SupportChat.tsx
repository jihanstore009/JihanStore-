import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Mic, 
  Square, 
  Image as ImageIcon, 
  Play, 
  Pause, 
  Clock, 
  User, 
  ShieldCheck, 
  Paperclip,
  CheckCheck
} from 'lucide-react';
import { ChatMessage } from '../types';
import { 
  subscribeToConversationMessages, 
  sendChatMessage, 
  getOrCreateConversationId 
} from '../services/storeService';
import { uploadMedia } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  customerPhone?: string;
  adminModeConversationId?: string; // If admin is viewing a specific conversation
}

export const SupportChat: React.FC<SupportChatProps> = ({
  isOpen,
  onClose,
  customerName = 'কাস্টমার',
  customerPhone = '',
  adminModeConversationId
}) => {
  const { isAdmin, currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Audio Playback State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Customer ID persistence
  const customerId = useRef<string>(
    currentUser?.uid || 
    localStorage.getItem('jihan_chat_customer_id') || 
    (() => {
      const newId = 'cust_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('jihan_chat_customer_id', newId);
      return newId;
    })()
  ).current;

  // Active conversation ID
  const activeConversationId = adminModeConversationId || getOrCreateConversationId(customerId);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = subscribeToConversationMessages(activeConversationId, (newMsgs) => {
      setMessages(newMsgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [isOpen, activeConversationId]);

  // Voice recording cleanup
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() && !selectedImageFile) return;

    setIsUploading(true);
    try {
      let fileUrl = '';
      if (selectedImageFile) {
        fileUrl = await uploadMedia(selectedImageFile, `support/images/${activeConversationId}`);
      }

      await sendChatMessage(
        activeConversationId,
        {
          senderId: isAdmin ? (currentUser?.uid || 'admin') : customerId,
          senderRole: isAdmin ? 'admin' : 'customer',
          senderName: isAdmin ? 'জিহান স্টোর সাপোর্ট' : customerName,
          type: fileUrl ? 'image' : 'text',
          text: text.trim() || undefined,
          fileUrl: fileUrl || undefined,
        },
        {
          customerId,
          customerName,
          customerPhone
        }
      );

      setText('');
      setSelectedImageFile(null);
      setSelectedImagePreview(null);
    } catch (err) {
      console.error('Failed to send chat message:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Start Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        setIsUploading(true);
        try {
          const audioUrl = await uploadMedia(audioBlob, `support/voice/${activeConversationId}`);
          await sendChatMessage(
            activeConversationId,
            {
              senderId: isAdmin ? (currentUser?.uid || 'admin') : customerId,
              senderRole: isAdmin ? 'admin' : 'customer',
              senderName: isAdmin ? 'জিহান স্টোর সাপোর্ট' : customerName,
              type: 'voice',
              fileUrl: audioUrl,
              audioDuration: recordingSeconds
            },
            {
              customerId,
              customerName,
              customerPhone
            }
          );
        } catch (err) {
          console.error('Failed to upload voice message:', err);
        } finally {
          setIsUploading(false);
          setRecordingSeconds(0);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('মাইক্রোফোন পারমিশন প্রয়োজন ভয়েস মেসেজ পাঠানোর জন্য।');
      console.error('Microphone access denied:', err);
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  // Audio Playback Helper
  const togglePlayAudio = (msgId: string, url: string) => {
    if (playingAudioId === msgId) {
      const audio = audioElementsRef.current[msgId];
      if (audio) {
        audio.pause();
      }
      setPlayingAudioId(null);
    } else {
      // Pause any currently playing
      if (playingAudioId && audioElementsRef.current[playingAudioId]) {
        audioElementsRef.current[playingAudioId].pause();
      }
      let audio = audioElementsRef.current[msgId];
      if (!audio) {
        audio = new Audio(url);
        audioElementsRef.current[msgId] = audio;
        audio.onended = () => setPlayingAudioId(null);
      }
      audio.play().catch((e) => console.warn('Audio play error:', e));
      setPlayingAudioId(msgId);
    }
  };

  // Handle Image File Selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setSelectedImagePreview(previewUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        id="support-chat-container"
        className="w-full sm:max-w-md h-[90vh] sm:h-[620px] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6 text-slate-900" />
              </div>
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full absolute bottom-0 right-0 border-2 border-blue-900" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {isAdmin ? `কাস্টমার চ্যাট (${customerName})` : 'জিহান স্টোর কাস্টমার সাপোর্ট'}
              </h3>
              <p className="text-[11px] text-blue-200 flex items-center gap-1">
                <span>২৪/৭ লাইভ অ্যাসিস্ট্যান্ট</span> • 
                <span className="text-emerald-300">অনলাইন</span>
              </p>
            </div>
          </div>

          <button
            id="chat-close-btn"
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Support Chat Notice */}
        <div className="bg-blue-50/80 px-4 py-2 text-[11px] text-blue-800 border-b border-blue-100 flex items-center justify-between">
          <span>সরাসরি টেক্সট, অডিও ভয়েস মেসেজ বা ছবির মাধ্যমে যে কোনো জিজ্ঞাসা জানান।</span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">জিহান স্টোরে স্বাগতম!</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                আপনার অর্ডার বা প্রোডাক্ট সম্পর্কে কোনো তথ্য জানতে আমাদের মেসেজ পাঠান।
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = isAdmin ? msg.senderRole === 'admin' : msg.senderRole === 'customer';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl p-3 text-xs sm:text-sm shadow-xs ${
                      isMe
                        ? 'bg-blue-700 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                    }`}
                  >
                    {/* Sender Label */}
                    <div className="text-[10px] font-bold mb-1 opacity-75 flex items-center gap-1">
                      {msg.senderRole === 'admin' ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-amber-300" />
                          <span>সাপোর্ট টিম</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3" />
                          <span>{msg.senderName}</span>
                        </>
                      )}
                    </div>

                    {/* Text Message */}
                    {msg.text && (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    )}

                    {/* Image Attachment */}
                    {msg.fileUrl && msg.type === 'image' && (
                      <div className="mt-1.5 overflow-hidden rounded-xl bg-black/10">
                        <img 
                          src={msg.fileUrl} 
                          alt="সংযুক্তি" 
                          className="max-h-48 w-auto object-cover rounded-xl cursor-pointer hover:opacity-95"
                          onClick={() => window.open(msg.fileUrl, '_blank')}
                        />
                      </div>
                    )}

                    {/* Voice Message Playback */}
                    {msg.fileUrl && msg.type === 'voice' && (
                      <div className="mt-1.5 flex items-center gap-2.5 bg-black/10 px-3 py-2 rounded-xl">
                        <button
                          type="button"
                          onClick={() => togglePlayAudio(msg.id, msg.fileUrl!)}
                          className="w-8 h-8 rounded-full bg-white text-blue-700 flex items-center justify-center shrink-0 shadow-xs active:scale-95 transition-transform"
                        >
                          {playingAudioId === msg.id ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-semibold">ভয়েস মেসেজ</span>
                            {msg.audioDuration && (
                              <span className="text-[10px] opacity-75">
                                ({msg.audioDuration}s)
                              </span>
                            )}
                          </div>
                          {/* Visual Waveform bars */}
                          <div className="flex items-center gap-0.5 mt-1 h-2">
                            {[40, 70, 30, 90, 50, 80, 45, 60, 20].map((h, i) => (
                              <span
                                key={i}
                                className={`w-1 rounded-full ${
                                  playingAudioId === msg.id
                                    ? 'bg-amber-400 animate-pulse'
                                    : isMe ? 'bg-white/40' : 'bg-slate-300'
                                }`}
                                style={{ height: `${h}%` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="mt-1 text-[9px] text-right opacity-70 flex items-center justify-end gap-1">
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Selected Image Preview before sending */}
        {selectedImagePreview && (
          <div className="p-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={selectedImagePreview} alt="প্রিভিউ" className="w-12 h-12 object-cover rounded-lg border border-slate-300" />
              <span className="text-xs text-slate-600 font-medium truncate max-w-[200px]">
                {selectedImageFile?.name}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedImageFile(null);
                setSelectedImagePreview(null);
              }}
              className="p-1 text-slate-500 hover:text-red-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="p-3 bg-red-50 border-t border-red-200 flex items-center justify-between text-red-600 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600" />
              <span className="text-xs font-bold">ভয়েস রেকর্ড হচ্ছে... {recordingSeconds}s</span>
            </div>
            <button
              onClick={stopRecording}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5" />
              <span>রেকর্ড সম্পন্ন</span>
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5 shrink-0">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Photo attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
            title="ছবি সংযুক্ত করুন"
            disabled={isUploading || isRecording}
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Voice recording button */}
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors shrink-0"
              title="ভয়েস রেকর্ড করুন"
              disabled={isUploading}
            >
              <Mic className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="p-2 bg-red-600 text-white rounded-xl shrink-0"
              title="রেকর্ড থামান"
            >
              <Square className="w-5 h-5" />
            </button>
          )}

          {/* Text Input */}
          <input
            id="chat-message-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isRecording ? 'ভয়েস রেকর্ড হচ্ছে...' : 'মেসেজ লিখুন...'}
            disabled={isRecording || isUploading}
            className="flex-1 py-2 px-3 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
          />

          {/* Send Button */}
          <button
            id="chat-send-btn"
            type="submit"
            disabled={(!text.trim() && !selectedImageFile) || isUploading || isRecording}
            className="p-2 bg-blue-700 text-white rounded-xl hover:bg-blue-800 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0"
            title="মেসেজ পাঠান"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
