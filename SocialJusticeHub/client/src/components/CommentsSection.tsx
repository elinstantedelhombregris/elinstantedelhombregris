import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Reply, 
  Edit2, 
  Trash2, 
  Send, 
  MoreHorizontal,
  User,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  postId: number;
  comments: Comment[];
  onAddComment: (content: string, parentId?: number) => Promise<void>;
  onEditComment: (commentId: number, content: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  currentUserId?: number;
  loading?: boolean;
}

export default function CommentsSection({
  postId,
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
        description: "No se pudo publicar el comentario. Inténtalo de nuevo.",
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
        description: "No se pudo editar el comentario. Inténtalo de nuevo.",
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
        description: "No se pudo eliminar el comentario. Inténtalo de nuevo.",
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
        className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}
      >
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{comment.user.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDate(comment.createdAt)}
                    {comment.updatedAt !== comment.createdAt && (
                      <Badge variant="secondary" className="text-xs">
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
                    onClick={() => {
                      setEditingComment(comment.id);
                      setEditContent(comment.content);
                    }}
                    disabled={isEditing}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Edita tu comentario..."
                  rows={3}
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEditSubmit(comment.id)}
                    disabled={isSubmitting || !editContent.trim()}
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
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            )}
            
            {!isReply && (
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment.id)}
                  disabled={!currentUserId}
                >
                  <Reply className="w-4 h-4 mr-2" />
                  Responder
                </Button>
                
                {hasReplies && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReplies(comment.id)}
                  >
                    {showRepliesForThis ? 'Ocultar' : 'Ver'} {comment.replies?.length} respuesta{comment.replies && comment.replies.length > 1 ? 's' : ''}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
            className="mt-4 ml-8"
          >
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <Textarea
                    ref={textareaRef}
                    placeholder={`Responder a ${comment.user.name}...`}
                    rows={3}
                    className="min-h-[80px]"
                    onChange={(e) => setNewComment(e.target.value)}
                    value={newComment}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSubmitComment(comment.id)}
                      disabled={isSubmitting || !newComment.trim()}
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
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Comment form */}
      {currentUserId && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Deja un comentario
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Textarea
                placeholder="Comparte tus pensamientos sobre este artículo..."
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSubmitComment()}
                  disabled={isSubmitting || !newComment.trim()}
                >
                  {isSubmitting ? 'Publicando...' : 'Publicar comentario'}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments list */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comentarios ({comments.length})
        </h3>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedComments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Aún no hay comentarios
              </h4>
              <p className="text-gray-500">
                Sé el primero en compartir tus pensamientos sobre este artículo.
              </p>
            </CardContent>
          </Card>
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
