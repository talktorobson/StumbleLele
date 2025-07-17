import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Brain, Sparkles, Zap, Gem, Radio } from "lucide-react";

interface AIModelSelectorProps {
  userId: number;
  currentModel?: string;
}

export default function AIModelSelector({ userId, currentModel = "gemini" }: AIModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateModelMutation = useMutation({
    mutationFn: async (aiModel: string) => {
      return await apiRequest("POST", `/api/user/${userId}/ai-model`, { aiModel });
    },
    onSuccess: () => {
      toast({
        title: "Modelo AI atualizado!",
        description: "Lele agora está usando o novo modelo de AI.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar modelo",
        description: "Não foi possível alterar o modelo de AI.",
        variant: "destructive",
      });
    },
  });

  const handleModelChange = (aiModel: string) => {
    setSelectedModel(aiModel);
    updateModelMutation.mutate(aiModel);
  };

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <h5 className="font-semibold text-sm text-gray-800">Modelo de AI da Lele</h5>
        <p className="text-xs text-gray-600">
          Escolha qual inteligência artificial a Lele deve usar para conversar
        </p>
      </div>
      
      <Select value={selectedModel} onValueChange={handleModelChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Escolha o modelo de AI" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gemini">
            <div className="flex items-center gap-2">
              <Gem className="h-4 w-4" />
              Google Gemini
            </div>
          </SelectItem>
          <SelectItem value="gemini-live">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              Gemini Live (WebSocket)
            </div>
          </SelectItem>
          <SelectItem value="openai">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              OpenAI GPT-4o
            </div>
          </SelectItem>
          <SelectItem value="xai">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              XAI Grok
            </div>
          </SelectItem>
          <SelectItem value="anthropic">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Anthropic Claude
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      <div className="text-sm text-muted-foreground">
        {selectedModel === "gemini" ? (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
            <Gem className="h-4 w-4 text-green-600" />
            <span className="text-xs">Google Gemini - Modelo rápido e inteligente (Recomendado)</span>
          </div>
        ) : selectedModel === "gemini-live" ? (
          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-md">
            <Radio className="h-4 w-4 text-emerald-600" />
            <span className="text-xs">Gemini Live - WebSocket com suporte a áudio (Experimental)</span>
          </div>
        ) : selectedModel === "openai" ? (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="text-xs">OpenAI GPT-4o - Modelo conversacional avançado</span>
          </div>
        ) : selectedModel === "xai" ? (
          <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-md">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-xs">XAI Grok - Modelo criativo e divertido</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-md">
            <Zap className="h-4 w-4 text-orange-600" />
            <span className="text-xs">Anthropic Claude - Modelo inteligente e útil</span>
          </div>
        )}
      </div>
      
      {updateModelMutation.isPending && (
        <div className="text-xs text-muted-foreground">
          Atualizando modelo...
        </div>
      )}
    </div>
  );
}