import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, UserPlus, Clock, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useFriendRequests } from "@/hooks/use-friends";
import { formatConversationDate, getOnlineStatusEmoji, getOnlineStatusText, getOnlineStatusColor } from "@/lib/chat-api";
import type { FriendRequest } from "@/types/chat";

interface FriendRequestsListProps {
  userId: number;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

export default function FriendRequestsList({ 
  userId, 
  isExpanded = false, 
  onToggleExpanded 
}: FriendRequestsListProps) {
  const { 
    requests, 
    isLoading, 
    acceptRequest, 
    rejectRequest,
    isAcceptingRequest,
    isRejectingRequest
  } = useFriendRequests(userId);

  const pendingRequests = requests.filter(req => req.user.id !== userId);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span>Pedidos de Amizade</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Carregando pedidos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingRequests.length === 0) {
    return null; // Don't show the component if there are no requests
  }

  const displayRequests = isExpanded ? pendingRequests : pendingRequests.slice(0, 3);

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-yellow-500" />
            <span>Pedidos de Amizade</span>
            <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
              {pendingRequests.length}
            </Badge>
          </div>
          {pendingRequests.length > 3 && onToggleExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpanded}
              className="text-yellow-600 hover:text-yellow-800"
            >
              {isExpanded ? "Ver menos" : `Ver todos (${pendingRequests.length})`}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {displayRequests.map((request) => (
              <FriendRequestCard
                key={request.id}
                request={request}
                onAccept={() => acceptRequest(request.user.id)}
                onReject={() => rejectRequest(request.user.id)}
                isAccepting={isAcceptingRequest}
                isRejecting={isRejectingRequest}
              />
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

// Individual Friend Request Card Component
interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept: () => void;
  onReject: () => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

function FriendRequestCard({ 
  request, 
  onAccept, 
  onReject, 
  isAccepting = false, 
  isRejecting = false 
}: FriendRequestCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept();
    } catch (error) {
      toast({
        title: "Erro ao aceitar pedido",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject();
    } catch (error) {
      toast({
        title: "Erro ao rejeitar pedido",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isDisabled = isProcessing || isAccepting || isRejecting;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Card className="bg-white border-2 border-yellow-200 hover:border-yellow-300 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full flex items-center justify-center text-2xl shadow-md">
                {request.user.avatarEmoji}
              </div>
              {/* Online status indicator */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                request.user.isOnline ? 'bg-green-400' : 'bg-gray-400'
              }`}>
                {getOnlineStatusEmoji(request.user.isOnline)}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 truncate">
                {request.user.displayName || request.user.username}
              </h4>
              <p className="text-sm text-gray-600 truncate">
                @{request.user.username}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getOnlineStatusColor(request.user.isOnline)}`}
                >
                  {getOnlineStatusText(request.user.isOnline)}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatConversationDate(request.createdAt)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={isDisabled}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isAccepting ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Aceitar</span>
                    <span className="sm:hidden">✓</span>
                  </>
                )}
              </Button>
              
              <Button
                size="sm"
                onClick={handleReject}
                disabled={isDisabled}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isRejecting ? (
                  <div className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Rejeitar</span>
                    <span className="sm:hidden">✗</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}