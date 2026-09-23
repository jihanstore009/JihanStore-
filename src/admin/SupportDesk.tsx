import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  Square, 
  Image as ImageIcon, 
  Play, 
  Pause, 
  Clock, 
  User, 
  Phone, 
  CheckCheck, 
  ShieldCheck, 
  X,
  Volume2
} from 'lucide-react';
import { ChatConversation, ChatMessage } from '../types';
import { 
  subscribeToConversations, 
  subscribeToConversationMessages, 
  sendChatMessage 
} from '../services/storeService';
import { uploadMedia } from '../firebase/config';

export const SupportDesk: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConv, setActiveConv] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Audio Voice Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Subscribe to all customer conversations
  useEffect(() => {
    const unsub = subscribeToConversations((convs) => {
      setConversations(convs);
      if (convs.length > 0 && !activeConv) {
        setActiveConv(convs[0]);
      }
    });
    return () => unsub();
  }, [activeConv]);

  // 2. Subscribe to messages of selected conversation
  useEffect(() => {
    if (!activeConv) return;
    const unsub = subscribeToConversationMessages(activeConv.id, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
    return () => unsub();
  }, [activeConv]);

  // Recording timer cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Send Admin Text / Image Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConv || (!inputText.trim() && !selectedImage)) return;

    setIsSending(true);
    try {
      let fileUrl = '';
      if (selectedImage) {
        fileUrl = await uploadMedia(selectedImage, `support/admin_${Date.now()}`);
      }

      await sendChatMessage(
        activeConv.id,
        {
          senderId: 'admin',
          senderRole: 'admin',
          senderName: 'জিহান স্টোর সাপোর্ট (Admin)',
          type: fileUrl ? 'image' : 'text',
          text: inputText.trim() || undefined,
          fileUrl: fileUrl || undefined
        },
        {
          customerId: activeConv.customerId,
          customerName: activeConv.customerName,
          customerPhone: activeConv.customerPhone
        }
      );

      setInputText('');
      setSelectedImage(null);
      setPreviewImage(null);
    } catch (err) {
      console.error('Failed to send admin message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Start Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        if (activeConv) {
          setIsSending(true);
          try {
            const audioUrl = await uploadMedia(audioBlob, `support/voice_admin_${Date.now()}`);
            await sendChatMessage(
              activeConv.id,
              {
                senderId: 'admin',
                senderRole: 'admin',
                senderName: 'জিহান স্টোর সাপোর্ট (Admin)',
                type: 'voice',
                fileUrl: audioUrl,
                audioDuration: recordSeconds
              },
              {
                customerId: activeConv.customerId,
                customerName: activeConv.customerName,
                customerPhone: activeConv.customerPhone
              }
            );
          } catch (err) {
            console.error('Failed to send admin voice message:', err);
          } finally {
            setIsSending(false);
            setRecordSeconds(0);
          }
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      alert('মাইক্রোফোন পারমিশন প্রয়োজন ভয়েস রেকর্ড করতে।');
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Toggle Audio Playback
  const togglePlayAudio = (msgId: string, url: string) => {
    if (playingAudioId === msgId) {
      audioRefs.current[msgId]?.pause();
      setPlayingAudioId(null);
    } else {
      if (playingAudioId && audioRefs.current[playingAudioId]) {
        audioRefs.current[playingAudioId].pause();
      }
      if (!audioRefs.current[msgId]) {
        const audio = new Audio(url);
        audio.onended = () => setPlayingAudioId(null);
        audioRefs.current[msgId] = audio;
      }
      audioRefs.current[msgId].play();
      setPlayingAudioId(msgId);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[650px] grid grid-cols-1 md:grid-cols-3">
      {/* LEFT: Conversations List */}
      <div className="border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h3 className="font-black text-sm text-slate-900 flex items-center justify-between">
            <span>কাস্টমার ইনবক্স</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              {conversations.length}
            </span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">রিয়েল-টাইম লাইভ চ্যাট মেসেজ</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">কোনো ইনবক্স নেই</p>
              <p className="text-[10px] text-slate-400 mt-1">কাস্টমার চ্যাটে মেসেজ দিলে এখানে দেখা যাবে।</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = activeConv?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{conv.customerName}</h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(conv.lastMessageAt || conv.lastMessageTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {conv.customerPhone && (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1">
                      <Phone className="w-2.5 h-2.5 text-blue-600" />
                      <span>{conv.customerPhone}</span>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-600 truncate">
                    {conv.lastMessage || 'ছবি / ভয়েস মেসেজ'}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: Active Chat View */}
      <div className="md:col-span-2 flex flex-col h-full bg-slate-50/30">
        {activeConv ? (
          <>
            {/* Chat Top Header */}
            <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {activeConv.customerName.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{activeConv.customerName}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    {activeConv.customerPhone && <span>{activeConv.customerPhone}</span>}
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-emerald-600 font-medium">লাইভ কানেক্টেড</span>
                  </div>
                </div>
              </div>
              {activeConv.customerPhone && (
                <a
                  href={`tel:${activeConv.customerPhone}`}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>কল</span>
                </a>
              )}
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                  <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-600">কোনো বার্তা পাওয়া যায়নি</p>
                  <p className="text-[11px] text-slate-400">নিচ থেকে কাস্টমারকে উত্তর দিন।</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderRole === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-slate-500">
                          {isMe ? 'জিহান স্টোর (অ্যাডমিন)' : msg.senderName}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[78%] rounded-2xl p-3 text-xs sm:text-sm ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm'
                        }`}
                      >
                        {/* Text message */}
                        {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}

                        {/* Image message */}
                        {msg.type === 'image' && msg.fileUrl && (
                          <div className="mt-1">
                            <img
                              src={msg.fileUrl}
                              alt="Attachment"
                              className="rounded-xl max-h-56 object-cover cursor-pointer hover:opacity-95"
                              onClick={() => window.open(msg.fileUrl, '_blank')}
                            />
                          </div>
                        )}

                        {/* Voice audio note */}
                        {msg.type === 'voice' && msg.fileUrl && (
                          <div className="flex items-center gap-3 py-1">
                            <button
                              onClick={() => togglePlayAudio(msg.id, msg.fileUrl!)}
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                                isMe ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                              }`}
                            >
                              {playingAudioId === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                            <div>
                              <div className="text-xs font-bold flex items-center gap-1">
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>ভয়েস নোট</span>
                              </div>
                              <span className="text-[10px] opacity-75">
                                {msg.audioDuration ? `${msg.audioDuration} সেকেন্ড` : 'অডিও শুনুন'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Console */}
            <div className="p-3 bg-white border-t border-slate-200">
              {/* Image preview before sending */}
              {previewImage && (
                <div className="mb-2 relative inline-block">
                  <img src={previewImage} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-slate-300" />
                  <button
                    onClick={() => { setSelectedImage(null); setPreviewImage(null); }}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Voice recording bar */}
              {isRecording ? (
                <div className="flex items-center justify-between p-2 bg-rose-50 border border-rose-200 rounded-xl">
                  <div className="flex items-center gap-2 text-rose-600 text-xs font-bold animate-pulse">
                    <span className="w-3 h-3 rounded-full bg-rose-600" />
                    <span>রেকর্ডিং হচ্ছে ({recordSeconds}s)...</span>
                  </div>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>রেকর্ড শেষ ও পাঠান</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  {/* Image upload button */}
                  <label className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer transition-colors">
                    <ImageIcon className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedImage(file);
                          setPreviewImage(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>

                  {/* Microphone voice note button */}
                  <button
                    type="button"
                    onClick={startRecording}
                    title="ভয়েস মেসেজ রেকর্ড করুন"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="কাস্টমারকে উত্তর লিখুন..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={isSending || (!inputText.trim() && !selectedImage)}
                    className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-700">বাম পাশ থেকে একটি কনভারসেশন নির্বাচন করুন</p>
            <p className="text-xs text-slate-500 mt-1">কাস্টমারদের সরাসরি লাইভ টেক্সট, অডিও এবং ছবি দিয়ে সাপোর্ট দিতে পারবেন।</p>
          </div>
        )}
      </div>
    </div>
  );
};
