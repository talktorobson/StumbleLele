import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Brain, Sparkles } from "lucide-react";

interface AIModelSelectorProps {
  userId: number;
  currentModel: string;
}

export default function AIModelSelector({ userId, currentModel }: AIModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateModelMutation = useMutation({
    mutationFn: async (aiModel: string) => {
      return await apiRequest(`/api/user/${userId}/ai-model`, {
        method: "POST",
        body: JSON.stringify({ aiModel }),
        headers: { "Content-Type": "application/json" },
      });
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
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Modelo de AI da Lele
        </CardTitle>
        <CardDescription>
          Escolha qual inteligência artificial a Lele deve usar para conversar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedModel} onValueChange={handleModelChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Escolha o modelo de AI" />
          </SelectTrigger>
          <SelectContent>
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
          </SelectContent>
        </Select>
        
        <div className="text-sm text-muted-foreground">
          {selectedModel === "openai" ? (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
              <Brain className="h-4 w-4 text-blue-600" />
              <span>OpenAI GPT-4o - Modelo conversacional avançado</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-md">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>XAI Grok - Modelo criativo e divertido</span>
            </div>
          )}
        </div>
        
        {updateModelMutation.isPending && (
          <div className="text-sm text-muted-foreground">
            Atualizando modelo...
          </div>
        )}
      </CardContent>
    </Card>
  );
}