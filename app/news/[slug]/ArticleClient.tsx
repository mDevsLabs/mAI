"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, MessageCircle, Send, Share2, Twitter, Facebook, Linkedin, Instagram, Youtube, Edit, Trash2, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/components/auth-provider';

export type Comment = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  message: string;
  timestamp: number;
  rating?: number;
};

interface ShareButtonsProps {
  title: string;
  description?: string;
}

export function ShareButtons({ title, description }: ShareButtonsProps) {
  return (
    <div className="mt-12 pt-8 border-t border-black/5">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Partager cet article</h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            const url = window.location.href;
            if (navigator.share) {
              navigator.share({ title, text: description, url });
            } else {
              toast.error("Partage non supporté sur cet appareil");
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          <Share2 className="w-4 h-4" />
          Partager
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-700 hover:text-[#1DA1F2]"
        >
          <Twitter className="w-4 h-4" />
          Twitter/X
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-700 hover:text-[#1877F2]"
        >
          <Facebook className="w-4 h-4" />
          Facebook
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-plugin/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-700 hover:text-[#0A66C2]"
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </a>
        <a
          href={`https://www.instagram.com/share?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-700 hover:text-[#E4405F]"
        >
          <Instagram className="w-4 h-4" />
          Instagram
        </a>
        <a
          href={`https://www.youtube.com/share?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-700 hover:text-[#FF0000]"
        >
          <Youtube className="w-4 h-4" />
          YouTube
        </a>
        <button
          onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url);
            toast.success("Lien copié !");
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          <Share2 className="w-4 h-4" />
          Copier le lien
        </button>
      </div>
    </div>
  );
}

function CommentForm({
  onAddComment,
  editingComment,
  onUpdateComment,
  authorName,
  authorEmail,
  authorAvatar,
}: {
  onAddComment: (comment: Comment) => void;
  editingComment?: Comment | null;
  onUpdateComment?: (comment: Comment) => void;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
}) {
  const [message, setMessage] = useState(editingComment?.message || '');
  const [rating, setRating] = useState(editingComment?.rating || 0);

  useEffect(() => {
    if (editingComment) {
      setMessage(editingComment.message || '');
      setRating(editingComment.rating || 0);
    } else {
      setMessage('');
      setRating(0);
    }
  }, [editingComment, authorAvatar]);
  
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName || !authorEmail || !message.trim()) {
      toast.error("Veuillez écrire un commentaire");
      return;
    }
    
    const newComment: Comment = {
      id: editingComment?.id || Date.now().toString(),
      name: authorName,
      email: authorEmail,
      avatar: authorAvatar || undefined,
      message: message.trim(),
      timestamp: editingComment?.timestamp || Date.now(),
      rating: rating || undefined,
    };
    
    if (editingComment && onUpdateComment) {
      onUpdateComment(newComment);
      toast.success("Commentaire mis à jour !");
    } else {
      onAddComment(newComment);
      toast.success("Commentaire publié !");
    }
    setMessage('');
    setRating(0);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
          <input
            type="text"
            value={authorName}
            readOnly
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 cursor-not-allowed"
            aria-label="Nom d'utilisateur du compte"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
          <input
            type="email"
            value={authorEmail}
            readOnly
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 cursor-not-allowed"
            aria-label="Email du compte"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Note (optionnel)</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`w-10 h-10 rounded-full border-2 transition-colors ${value <= rating ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-slate-300 hover:bg-orange-50'}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Commentaire</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          placeholder="Partagez votre avis..."
          required
        />
      </div>
      
      <button
        type="submit"
        className="px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors flex items-center gap-2"
      >
        <Send className="w-5 h-5" />
        {editingComment ? 'Mettre à jour le commentaire' : 'Publier le commentaire'}
      </button>
    </form>
  );
}

function CommentItem({ comment, commentId, onDelete, onEdit }: { comment: Comment; commentId: string; onDelete?: (id: string) => void; onEdit?: (comment: Comment) => void }) {
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [unhelpfulCount, setUnhelpfulCount] = useState(0);
  const [hasVoted, setHasVoted] = useState<'helpful' | 'unhelpful' | null>(null);
  
  useEffect(() => {
    const savedVote = localStorage.getItem(`vote_${commentId}`);
    if (savedVote === 'helpful') setHasVoted('helpful');
    else if (savedVote === 'unhelpful') setHasVoted('unhelpful');
    const counts = JSON.parse(localStorage.getItem(`votes_${commentId}`) || '{"helpful":0,"unhelpful":0}');
    setHelpfulCount(counts.helpful || 0);
    setUnhelpfulCount(counts.unhelpful || 0);
  }, [commentId]);
  
  const handleHelpful = () => {
    const counts = JSON.parse(localStorage.getItem(`votes_${commentId}`) || '{"helpful":0,"unhelpful":0}');
    if (hasVoted === 'helpful') {
      localStorage.removeItem(`vote_${commentId}`);
      localStorage.setItem(`votes_${commentId}`, JSON.stringify({ ...counts, helpful: counts.helpful - 1 }));
      setHasVoted(null);
      setHelpfulCount(counts.helpful - 1);
    } else {
      const newCounts = hasVoted === 'unhelpful' 
        ? { ...counts, helpful: counts.helpful + 1, unhelpful: counts.unhelpful - 1 }
        : { ...counts, helpful: counts.helpful + 1 };
      localStorage.setItem(`vote_${commentId}`, 'helpful');
      localStorage.setItem(`votes_${commentId}`, JSON.stringify(newCounts));
      setHasVoted('helpful');
      setHelpfulCount(newCounts.helpful);
      if (hasVoted === 'unhelpful') setUnhelpfulCount(newCounts.unhelpful);
    }
  };
  
  const handleUnhelpful = () => {
    const counts = JSON.parse(localStorage.getItem(`votes_${commentId}`) || '{"helpful":0,"unhelpful":0}');
    if (hasVoted === 'unhelpful') {
      localStorage.removeItem(`vote_${commentId}`);
      localStorage.setItem(`votes_${commentId}`, JSON.stringify({ ...counts, unhelpful: counts.unhelpful - 1 }));
      setHasVoted(null);
      setUnhelpfulCount(counts.unhelpful - 1);
    } else {
      const newCounts = hasVoted === 'helpful'
        ? { ...counts, helpful: counts.helpful - 1, unhelpful: counts.unhelpful + 1 }
        : { ...counts, unhelpful: counts.unhelpful + 1 };
      localStorage.setItem(`vote_${commentId}`, 'unhelpful');
      localStorage.setItem(`votes_${commentId}`, JSON.stringify(newCounts));
      setHasVoted('unhelpful');
      setUnhelpfulCount(newCounts.unhelpful);
      if (hasVoted === 'helpful') setHelpfulCount(newCounts.helpful);
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getAvatarElement = () => {
    if (comment.avatar && comment.avatar.startsWith('http')) {
      return (
        <Image
          src={comment.avatar}
          alt={comment.name}
          width={48}
          height={48}
          unoptimized
          className="w-12 h-12 rounded-full object-cover border-2 border-orange-200 bg-white"
        />
      );
    } else if (comment.avatar && comment.avatar.match(/[^\u0000-\uFFFF]/)) {
      return (
        <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-orange-200 flex items-center justify-center text-xl">
          {comment.avatar}
        </div>
      );
    } else {
      return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-orange-200 flex items-center justify-center text-white font-semibold text-lg">
          {comment.name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)}
        </div>
      );
    }
  };
  
  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-6 transition-all hover:shadow-md">
      <div className="flex items-start gap-4 mb-4">
        {getAvatarElement()}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-slate-900">{comment.name}</h4>
            <span className="text-xs text-slate-500">{formatDate(comment.timestamp)}</span>
          </div>
          <p className="text-sm text-slate-500 mb-2">{comment.email}</p>
          {comment.rating && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-sm text-slate-600">Note:</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <ThumbsUp
                    key={i}
                    className={`w-4 h-4 ${i < comment.rating! ? 'text-orange-500 fill-orange-500' : 'text-slate-300'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-slate-700 mb-4 leading-relaxed">{comment.message}</p>
      
      <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
        <button
          onClick={handleHelpful}
          className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors text-sm ${hasVoted === 'helpful' ? 'text-orange-500 bg-orange-100' : hasVoted === 'unhelpful' ? 'text-slate-400' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <ThumbsUp className="w-4 h-4" />
          Utile ({helpfulCount})
        </button>
        <button
          onClick={handleUnhelpful}
          className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors text-sm ${hasVoted === 'unhelpful' ? 'text-slate-500 bg-slate-100' : hasVoted === 'helpful' ? 'text-slate-400' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <ThumbsDown className="w-4 h-4" />
          Inutile ({unhelpfulCount})
        </button>
        {onEdit && (
          <button
            onClick={() => onEdit(comment)}
            className="flex items-center gap-2 px-3 py-1 rounded-full text-slate-600 hover:bg-slate-100 transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => {
              onDelete(commentId);
              toast.success("Commentaire supprimé !");
            }}
            className="flex items-center gap-2 px-3 py-1 rounded-full text-slate-600 hover:bg-red-100 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
}

export function CommentSection({ articleSlug }: { articleSlug: string }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const nextPath = `/news/${articleSlug}`;
  
  useEffect(() => {
    const storedComments = localStorage.getItem(`comments_${articleSlug}`);
    if (storedComments) {
      try {
        setComments(JSON.parse(storedComments));
      } catch {
        setComments([]);
      }
    } else {
      setComments([]);
    }
    setHydrated(true);
  }, [articleSlug]);

  // Synchroniser l'avatar de l'utilisateur connecté avec ses anciens commentaires
  useEffect(() => {
    if (user?.email && comments.length > 0) {
      let changed = false;
      const updatedComments = comments.map(c => {
        if (c.email === user.email && c.avatar !== (user.avatarUrl || '')) {
          changed = true;
          return { ...c, avatar: user.avatarUrl || '' };
        }
        return c;
      });
      if (changed) {
        setComments(updatedComments);
        localStorage.setItem(`comments_${articleSlug}`, JSON.stringify(updatedComments));
      }
    }
  }, [user, comments, articleSlug]);
  
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(`comments_${articleSlug}`, JSON.stringify(comments));
  }, [comments, articleSlug, hydrated]);
  
  const addComment = (comment: Comment) => {
    setComments(prev => [comment, ...prev]);
  };
  
  const updateComment = (updatedComment: Comment) => {
    setComments(prev => prev.map(c => c.id === updatedComment.id ? updatedComment : c));
    setEditingComment(null);
  };
  
  const deleteComment = (id: string) => {
    setComments(prev => {
      const next = prev.filter(c => c.id !== id);
      return next;
    });
    setEditingComment(null);
  };
  
  const avgRating = comments.length > 0
    ? comments.reduce((sum, comment) => (comment.rating || 0) + sum, 0) / comments.length
    : 0;

  const canModerate = (comment: Comment) =>
    isAuthenticated &&
    !!user?.email &&
    comment.email.toLowerCase() === user.email.toLowerCase();
  
  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-orange-500" />
            Commentaires ({comments.length})
          </h3>
          <p className="text-slate-600">Partagez votre avis sur cet article</p>
        </div>
        {comments.length > 0 && (
          <div className="text-right">
            <div className="text-sm text-slate-600 mb-1">Note moyenne</div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <ThumbsUp
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(avgRating) ? 'text-orange-500 fill-orange-500' : 'text-slate-300'}`}
                  />
                ))}
              </div>
              <span className="font-semibold text-slate-900">{avgRating.toFixed(1)}/5</span>
            </div>
          </div>
        )}
      </div>

      {authLoading ? (
        <div className="mb-8 p-6 rounded-2xl bg-white/40 border border-white/60 text-slate-500 text-sm">
          Chargement de la session…
        </div>
      ) : isAuthenticated && user ? (
        <CommentForm
          onAddComment={addComment}
          editingComment={editingComment}
          onUpdateComment={updateComment}
          authorName={user.username}
          authorEmail={user.email}
          authorAvatar={user.avatarUrl}
        />
      ) : (
        <div className="mb-8 p-6 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 text-center space-y-4">
          <p className="text-slate-700 font-medium">
            Connectez-vous avec votre compte mAI pour commenter.
          </p>
          <p className="text-sm text-slate-500">
            Votre e-mail et nom d&apos;utilisateur seront associés au commentaire.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={`/account/login?next=${encodeURIComponent(nextPath)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Se connecter
            </Link>
            <Link
              href={`/account/register?next=${encodeURIComponent(nextPath)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-semibold transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Créer un compte
            </Link>
          </div>
        </div>
      )}
      
      {comments.length > 0 ? (
        <div className="space-y-6 mt-8">
          {comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              commentId={comment.id} 
              onDelete={canModerate(comment) ? deleteComment : undefined}
              onEdit={canModerate(comment) ? setEditingComment : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl">
          <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-700 mb-2">Soyez le premier à commenter</h4>
          <p className="text-slate-500">Partagez vos thoughts et aidez les autres à découvrir cet article</p>
        </div>
      )}
    </div>
  );
}