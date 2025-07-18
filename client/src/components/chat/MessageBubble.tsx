import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Edit2, Trash2, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { formatMessageTime } from "@/lib/chat-api";
import type { MessageWithSender } from "@/types/chat";

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwn: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}

export default function MessageBubble({
  message,
  isOwn,
  onEdit,
  onDelete
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleEdit = async () => {
    if (onEdit && editContent.trim() !== message.content) {
      setIsLoading(true);
      try {
        await onEdit(message.id, editContent.trim());
        setIsEditMode(false);
      } catch (error) {
        // Error handling is done in the parent component
        console.error('Error editing message:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsEditMode(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      setIsLoading(true);
      try {
        await onDelete(message.id);
        setShowDeleteDialog(false);
      } catch (error) {
        // Error handling is done in the parent component
        console.error('Error deleting message:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditMode(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Format the message content for display
  const formattedContent = message.content.replace(/\n/g, ' ').trim();
  const isLongMessage = formattedContent.length > 200;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'} group relative`}
    >
      {/* Sender Avatar (for received messages) */}
      {!isOwn && (
        <div className="w-8 h-8 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center text-lg flex-shrink-0">
          {message.sender.avatar_emoji}
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%] sm:max-w-[80%]`}>
        {/* Sender Name (for received messages) */}
        {!isOwn && (
          <div className="text-xs text-gray-500 mb-1 px-2">
            {message.sender.display_name || message.sender.username}
          </div>
        )}

        {/* Message Bubble */}
        <div className="relative">
          <div
            className={`
              px-4 py-3 rounded-2xl shadow-sm max-w-full break-words
              ${isOwn 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md' 
                : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
              }
              ${isLongMessage ? 'text-sm' : 'text-base'}
              ${isEditMode ? 'ring-2 ring-pink-400' : ''}
              transition-all duration-200
            `}
          >
            {/* Edit Mode */}
            {isEditMode ? (
              <div className="space-y-2">
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
                  placeholder="Editar mensagem..."
                  autoFocus
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEdit}
                    disabled={!editContent.trim() || isLoading}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    {isLoading ? (
                      <div className="animate-spin w-3 h-3 border border-white/70 border-t-transparent rounded-full" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="leading-relaxed whitespace-pre-wrap">
                  {formattedContent}
                </p>
                
                {/* Message Type Indicator */}
                {message.message_type !== 'text' && (
                  <div className="mt-2 text-xs opacity-70">
                    {message.message_type === 'emoji' && '😊 Emoji'}
                    {message.message_type === 'image' && '🖼️ Imagem'}
                    {message.message_type === 'audio' && '🎵 Áudio'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message Actions (for own messages) */}
          {isOwn && !isEditMode && (onEdit || onDelete) && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -right-2 top-0">
              <Dialog open={showActions} onOpenChange={setShowActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActions(true)}
                  className="w-8 h-8 p-0 bg-white/80 hover:bg-white shadow-md rounded-full"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-600" />
                </Button>
                <DialogContent className="max-w-xs">
                  <DialogHeader>
                    <DialogTitle className="text-sm">Ações da mensagem</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditMode(true);
                          setShowActions(false);
                        }}
                        className="w-full justify-start"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowActions(false);
                          setShowDeleteDialog(true);
                        }}
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Message Time */}
        <div className={`text-xs text-gray-500 mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
          {formatMessageTime(message.created_at)}
          {isOwn && (
            <span className="ml-1">
              {/* Read receipts placeholder */}
              ✓
            </span>
          )}
        </div>
      </div>

      {/* Sender Avatar (for sent messages) */}
      {isOwn && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full flex items-center justify-center text-lg flex-shrink-0">
          {message.sender.avatar_emoji}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Deletar mensagem?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Esta ação não pode ser desfeita. A mensagem será removida para todos.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                {isLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  "Deletar"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}