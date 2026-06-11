import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Reply,
  Edit2,
  Trash2,
  Send,
  User,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    username: string;
  };
  parentId?: number;
  replies?: Comment[];
}

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (content: string, parentId?: number) => Promise<void>;
  onEditComment: (commentId: number, content: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  currentUserId?: number;
  loading?: boolean;
}

export default function CommentsSection({
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  currentUserId,
  loading = false
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showReplies, setShowReplies] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sort comments by date (newest first)
  const sortedComments = [...comments].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleSubmitComment = async (parentId?: number) => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim(), parentId);
      setNewComment('');
      setReplyingTo(null);
      toast({
        title: "Comentario publicado",
        description: "Tu comentario ha sido publicado exitosamente",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo publicar el comentario. Intentalo de nuevo.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (commentId: number) => {
    if (!editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onEditComment(commentId, editContent.trim());
      setEditingComment(null);
      setEditContent('');
      toast({
        title: "Comentario editado",
        description: "Tu comentario ha sido actualizado",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo editar el comentario. Intentalo de nuevo.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await onDeleteComment(commentId);
      toast({
        title: "Comentario eliminado",
        description: "Tu comentario ha sido eliminado",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario. Intentalo de nuevo.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const toggleReplies = (commentId: number) => {
    const newShowReplies = new Set(showReplies);
    if (newShowReplies.has(commentId)) {
      newShowReplies.delete(commentId);
    } else {
      newShowReplies.add(commentId);
    }
    setShowReplies(newShowReplies);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace menos de una hora';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;

    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isOwner = currentUserId === comment.user.id;
    const isEditing = editingComment === comment.id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const showRepliesForThis = showReplies.has(comment.id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${isReply ? 'ml-8 border-l-2 border-white/10 pl-4' : ''}`}
      >
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          {/* Comment header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/40 to-purple-600/40 ring-1 ring-white/10">
                <User className="h-4 w-4 text-slate-300" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-100">{comment.user.name}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {formatDate(comment.createdAt)}
                  {comment.updatedAt !== comment.createdAt && (
                    <Badge variant="secondary" className="bg-white/5 text-xs text-slate-400 border-white/10">
                      Editado
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Editar comentario"
                  onClick={() => {
                    setEditingComment(comment.id);
                    setEditContent(comment.content);
                  }}
                  disabled={isEditing}
                  className="h-8 w-8 p-0 text-slate-500 hover:bg-white/5 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                >
                  <Edit2 className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Eliminar comentario"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="h-8 w-8 p-0 text-slate-500 hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>

          {/* Comment body */}
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Editá tu comentario..."
                rows={3}
                className="min-h-[80px] border-white/10 bg-white/5 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500/70"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleEditSubmit(comment.id)}
                  disabled={isSubmitting || !editContent.trim()}
                  className="bg-[#7D5BDE] text-white hover:bg-[#8d6ee6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent('');
                  }}
                  className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-slate-300">
              {comment.content}
            </p>
          )}

          {/* Reply / show replies controls */}
          {!isReply && (
            <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(comment.id)}
                disabled={!currentUserId}
                className="h-8 gap-1.5 px-2 text-xs text-slate-500 hover:bg-white/5 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
              >
                <Reply className="h-4 w-4" aria-hidden="true" />
                Responder
              </Button>

              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReplies(comment.id)}
                  className="h-8 px-2 text-xs text-slate-500 hover:bg-white/5 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                >
                  {showRepliesForThis ? 'Ocultar' : 'Ver'} {comment.replies?.length} respuesta{comment.replies && comment.replies.length > 1 ? 's' : ''}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Replies */}
        <AnimatePresence>
          {hasReplies && showRepliesForThis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {comment.replies?.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reply form */}
        {replyingTo === comment.id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-2 ml-8"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="space-y-3">
                <Textarea
                  ref={textareaRef}
                  placeholder={`Responder a ${comment.user.name}...`}
                  rows={3}
                  className="min-h-[80px] border-white/10 bg-white/5 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500/70"
                  onChange={(e) => setNewComment(e.target.value)}
                  value={newComment}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitComment(comment.id)}
                    disabled={isSubmitting || !newComment.trim()}
                    className="bg-[#7D5BDE] text-white hover:bg-[#8d6ee6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                  >
                    {isSubmitting ? 'Enviando...' : 'Responder'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setNewComment('');
                    }}
                    className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Comment form */}
      {currentUserId && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
            <MessageCircle className="h-5 w-5 text-violet-400" aria-hidden="true" />
            Dejá un comentario
          </h3>
          <div className="space-y-3">
            <Textarea
              placeholder="Compartí tus pensamientos sobre este artículo..."
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] border-white/10 bg-white/5 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500/70"
            />
            <div className="flex justify-end">
              <Button
                onClick={() => handleSubmitComment()}
                disabled={isSubmitting || !newComment.trim()}
                className="bg-[#7D5BDE] text-white hover:bg-[#8d6ee6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
              >
                {isSubmitting ? 'Publicando...' : 'Publicar comentario'}
                <Send className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments list */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
          <MessageCircle className="h-5 w-5 text-violet-400" aria-hidden="true" />
          Comentarios ({comments.length})
        </h3>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/5" />
                  <div>
                    <div className="mb-2 h-4 w-24 rounded bg-white/5" />
                    <div className="h-3 w-16 rounded bg-white/5" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded bg-white/5" />
                  <div className="h-3 w-3/4 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedComments.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-12 text-center">
            <MessageCircle className="mx-auto mb-4 h-12 w-12 text-slate-500" aria-hidden="true" />
            <h4 className="mb-2 text-lg font-medium text-slate-100">
              Aún no hay comentarios
            </h4>
            <p className="text-slate-500">
              Sé el primero en compartir tus pensamientos sobre este artículo.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {sortedComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
