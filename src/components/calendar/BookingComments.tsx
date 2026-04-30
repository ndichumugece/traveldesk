import { useState, useEffect, useRef, useMemo } from 'react';
import { Send, AtSign, Loader2, MessageSquare, Trash2, User as UserIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import { useUsers } from '../../hooks/useUsers';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    user_name?: string;
    user_avatar?: string | null;
}

interface BookingCommentsProps {
    bookingId: string;
}

export function BookingComments({ bookingId }: BookingCommentsProps) {
    const { user, profile, agencyId } = useAuth();
    const { data: users = [] } = useUsers();
    
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    
    // Mention State
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const filteredUsers = useMemo(() => {
        const otherUsers = users.filter(u => u.id !== user?.id);
        if (!mentionQuery) return otherUsers;
        return otherUsers.filter(u => 
            u.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(mentionQuery.toLowerCase())
        );
    }, [users, mentionQuery, user?.id]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('booking_comments')
                .select(`
                    *,
                    profiles:user_id (full_name, avatar_url)
                `)
                .eq('booking_id', bookingId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            
            const formatted = data.map((c: any) => ({
                id: c.id,
                content: c.content,
                user_id: c.user_id,
                created_at: c.created_at,
                user_name: c.profiles?.full_name || 'Unknown User',
                user_avatar: c.profiles?.avatar_url
            }));
            
            setComments(formatted);
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
        
        // Subscription for real-time comments
        const channel = supabase
            .channel(`booking-comments-${bookingId}`)
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'booking_comments',
                filter: `booking_id=eq.${bookingId}`
            }, () => {
                fetchComments();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [bookingId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const pos = e.target.selectionStart;
        setNewComment(value);
        setCursorPosition(pos);

        // Detect @ mention
        const textBeforeCursor = value.slice(0, pos);
        const atIndex = textBeforeCursor.lastIndexOf('@');
        
        if (atIndex !== -1 && (atIndex === 0 || textBeforeCursor[atIndex - 1] === ' ')) {
            const query = textBeforeCursor.slice(atIndex + 1);
            if (!query.includes(' ')) {
                setMentionQuery(query);
                setShowMentions(true);
                return;
            }
        }
        setShowMentions(false);
    };

    const insertMention = (userName: string) => {
        const textBeforeAt = newComment.slice(0, newComment.lastIndexOf('@', cursorPosition - 1));
        const textAfterCursor = newComment.slice(cursorPosition);
        const updatedValue = `${textBeforeAt}@${userName} ${textAfterCursor}`;
        
        setNewComment(updatedValue);
        setShowMentions(false);
        inputRef.current?.focus();
    };

    const handleSend = async () => {
        if (!newComment.trim() || sending || !user || !agencyId) return;
        
        const contentToSend = newComment.trim();
        setNewComment(''); // Clear input instantly

        // Optimistic UI update
        const tempId = `temp-${Date.now()}`;
        const optimisticComment = {
            id: tempId,
            content: contentToSend,
            user_id: user.id,
            created_at: new Date().toISOString(),
            user_name: profile?.full_name || user?.email || 'Unknown User',
            user_avatar: profile?.avatar_url
        };
        
        setComments(prev => [...prev, optimisticComment]);
        
        try {
            setSending(true);
            const { data, error } = await supabase
                .from('booking_comments')
                .insert({
                    booking_id: bookingId,
                    user_id: user.id,
                    agency_id: agencyId,
                    content: contentToSend
                })
                .select(`
                    *,
                    profiles:user_id (full_name, avatar_url)
                `)
                .single();

            if (error) throw error;
            
            // Replace optimistic comment with actual database record
            setComments(prev => prev.map(c => c.id === tempId ? {
                id: data.id,
                content: data.content,
                user_id: data.user_id,
                created_at: data.created_at,
                user_name: data.profiles?.full_name || 'Unknown User',
                user_avatar: data.profiles?.avatar_url
            } : c));
        } catch (err) {
            console.error('Error sending comment:', err);
            // Revert on error
            setComments(prev => prev.filter(c => c.id !== tempId));
            setNewComment(contentToSend); // Restore text
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        try {
            // Optimistic UI update for instant feedback
            setComments(prev => prev.filter(c => c.id !== commentId));
            
            const { error } = await supabase
                .from('booking_comments')
                .delete()
                .eq('id', commentId);
            if (error) throw error;
        } catch (err) {
            console.error('Error deleting comment:', err);
            fetchComments(); // Revert on error
        }
    };

    return (
        <div className="flex flex-col gap-6 mt-8 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-2 text-brand-600">
                <MessageSquare size={18} />
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">Activity & Comments</h4>
            </div>

            {/* Comment List */}
            <div className="space-y-6">
                {loading && comments.length === 0 ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-sm text-slate-400 italic text-center py-4">No comments yet. Start the conversation!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-brand-600 font-bold shrink-0 shadow-sm border border-slate-100">
                                {comment.user_avatar ? (
                                    <img src={comment.user_avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <span className="text-xs">{comment.user_name?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-900">{comment.user_name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-medium text-slate-400">
                                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                        </span>
                                        {comment.user_id === user?.id && (
                                            <button 
                                                onClick={() => handleDelete(comment.id)}
                                                className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    {comment.content.split(' ').map((word, i) => (
                                        word.startsWith('@') ? (
                                            <span key={i} className="text-brand-600 font-bold">{word} </span>
                                        ) : word + ' '
                                    ))}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="relative mt-4">
                {showMentions && filteredUsers.length > 0 && (
                    <div className="absolute bottom-full left-0 w-full mb-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-20 animate-in slide-in-from-bottom-2 duration-200">
                        <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Mention Team Member</span>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {filteredUsers.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => insertMention(u.name.replace(/\s+/g, ''))}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-brand-50 transition-colors text-left group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-brand-600 font-bold transition-all">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">{u.name}</div>
                                        <div className="text-[10px] text-slate-400">{u.email}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="relative group">
                    <textarea
                        ref={inputRef}
                        value={newComment}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Write a message... use @ to mention"
                        className="w-full p-4 pb-12 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 resize-none h-24"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <button 
                            onClick={() => {
                                setNewComment(prev => prev + '@');
                                setShowMentions(true);
                                inputRef.current?.focus();
                            }}
                            className={cn(
                                "p-2 rounded-xl transition-all",
                                showMentions ? "bg-brand-100 text-brand-600" : "text-slate-400 hover:text-brand-600 hover:bg-slate-100"
                            )}
                        >
                            <AtSign size={18} />
                        </button>
                        <button
                            disabled={!newComment.trim() || sending}
                            onClick={handleSend}
                            className={cn(
                                "p-2 rounded-xl transition-all shadow-lg active:scale-95",
                                newComment.trim() && !sending 
                                    ? "bg-brand-600 text-white shadow-brand-500/20 hover:bg-brand-700" 
                                    : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                            )}
                        >
                            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium px-2 mt-2 flex items-center gap-2">
                    <UserIcon size={12} />
                    Messages are visible to your entire agency team.
                </p>
            </div>
        </div>
    );
}

