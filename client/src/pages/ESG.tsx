import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { skipToken } from "@tanstack/react-query";
import { Award, CheckCircle2, Circle, Leaf, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ESG() {
  const { user } = useAuth();
  const farmId = user?.id;

  const { data: checklists, refetch: refetchChecklists } = trpc.esg.listChecklists.useQuery(
    farmId ? { farmId } : skipToken
  );

  const { data: responses, refetch: refetchResponses } = trpc.esg.listResponses.useQuery(
    farmId ? { farmId } : skipToken
  );

  const { data: badge } = trpc.esg.getBadge.useQuery(
    farmId ? { farmId } : skipToken
  );

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const answerQuestion = trpc.esg.answerQuestion.useMutation({
    onSuccess: () => {
      refetchResponses();
      refetchChecklists();
      toast.success("Resposta registrada!");
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleAnswer = (checklistId: number, answer: boolean) => {
    if (!farmId) {
      toast.error("Fazenda não identificada");
      return;
    }

    answerQuestion.mutate({
      farmId,
      checklistId,
      answer,
    });
  };

  const isAnswered = (checklistId: number): boolean | null => {
    const response = responses?.find((r: any) => r.checklistId === checklistId);
    return response ? response.response : null;
  };

  const calculateScore = () => {
    if (!checklists || !responses) return 0;
    
    const totalPoints = checklists.reduce((sum: number, item: any) => sum + item.maxPoints, 0);
    const earnedPoints = responses
      .filter((r: any) => r.response === true)
      .reduce((sum: number, r: any) => {
        const checklist = checklists.find((c: any) => c.id === r.checklistId);
        return sum + (checklist?.maxPoints || 0);
      }, 0);

    return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  };

  const getBadgeInfo = (score: number) => {
    if (score >= 90) {
      return {
        name: "Ouro",
        color: "from-yellow-400 to-yellow-600",
        textColor: "text-yellow-600",
        bgColor: "bg-yellow-50",
        icon: "🥇",
        description: "Excelência em sustentabilidade",
      };
    } else if (score >= 60) {
      return {
        name: "Prata",
        color: "from-gray-300 to-gray-500",
        textColor: "text-gray-600",
        bgColor: "bg-gray-50",
        icon: "🥈",
        description: "Boas práticas sustentáveis",
      };
    } else if (score >= 30) {
      return {
        name: "Bronze",
        color: "from-orange-400 to-orange-600",
        textColor: "text-orange-600",
        bgColor: "bg-orange-50",
        icon: "🥉",
        description: "Iniciando jornada sustentável",
      };
    } else {
      return {
        name: "Sem Selo",
        color: "from-gray-200 to-gray-400",
        textColor: "text-gray-500",
        bgColor: "bg-gray-50",
        icon: "⭕",
        description: "Continue respondendo o checklist",
      };
    }
  };

  const groupByCategory = () => {
    if (!checklists) return {};
    
    return checklists.reduce((acc: any, item: any) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, any>);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      ambiental: Leaf,
      social: Award,
      governanca: Sparkles,
    };
    return icons[category] || Circle;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ambiental: "Ambiental",
      social: "Social",
      governanca: "Governança",
    };
    return labels[category] || category;
  };

  const score = calculateScore();
  const badgeInfo = getBadgeInfo(score);
  const groupedChecklists = groupByCategory();
  const answeredCount = responses?.length || 0;
  const totalQuestions = checklists?.length || 0;
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Leaf className="w-8 h-8 text-green-600" />
            Métricas ESG
          </h1>
          <p className="text-gray-600 mt-1">
            Avalie suas práticas ambientais, sociais e de governança
          </p>
        </div>

        {/* Score and Badge Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Score Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Pontuação ESG</CardTitle>
              <CardDescription>
                Responda o checklist para aumentar sua pontuação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-5xl font-bold text-green-600">{score}</div>
                  <div className="text-sm text-gray-600 mt-1">de 100 pontos</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-gray-700">
                    {answeredCount}/{totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">questões respondidas</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progresso do Checklist</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {responses?.filter((r: any) => r.response === true).length || 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Práticas Adotadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {responses?.filter((r: any) => r.response === false).length || 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Não Adotadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">
                    {totalQuestions - answeredCount}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Pendentes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badge Card */}
          <Card className={`${badgeInfo.bgColor} border-2`}>
            <CardHeader className="text-center pb-4">
              <div className="text-6xl mb-4">{badgeInfo.icon}</div>
              <CardTitle className={`text-2xl ${badgeInfo.textColor}`}>
                Selo {badgeInfo.name}
              </CardTitle>
              <CardDescription className="mt-2">{badgeInfo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bronze (30 pts)</span>
                  <span className={score >= 30 ? "text-green-600 font-semibold" : "text-gray-400"}>
                    {score >= 30 ? "✓" : ""}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Prata (60 pts)</span>
                  <span className={score >= 60 ? "text-green-600 font-semibold" : "text-gray-400"}>
                    {score >= 60 ? "✓" : ""}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ouro (90 pts)</span>
                  <span className={score >= 90 ? "text-green-600 font-semibold" : "text-gray-400"}>
                    {score >= 90 ? "✓" : ""}
                  </span>
                </div>
              </div>

              {score < 90 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>
                      Faltam {score < 30 ? 30 - score : score < 60 ? 60 - score : 90 - score} pontos
                      para o próximo selo
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Checklist by Category */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Checklist ESG</h2>

          {Object.entries(groupedChecklists).map(([category, items]) => {
            const Icon = getCategoryIcon(category);
            const isExpanded = expandedCategory === category;
            const categoryAnswered = (items as any[]).filter((item: any) => isAnswered(item.id) !== null).length;
            const categoryTotal = (items as any[]).length;

            return (
              <Card key={category}>
                <CardHeader
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedCategory(isExpanded ? null : category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-green-600" />
                      <div>
                        <CardTitle>{getCategoryLabel(category)}</CardTitle>
                        <CardDescription>
                          {categoryAnswered} de {categoryTotal} questões respondidas
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress
                        value={(categoryAnswered / categoryTotal) * 100}
                        className="w-32 h-2"
                      />
                      <span className="text-sm text-gray-600">
                        {Math.round((categoryAnswered / categoryTotal) * 100)}%
                      </span>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4 pt-4 border-t">
                    {(items as any[]).map((item: any) => {
                      const answer = isAnswered(item.id);

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            answer === true
                              ? "bg-green-50 border-green-200"
                              : answer === false
                              ? "bg-red-50 border-red-200"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                              <p className="text-sm text-gray-600">{item.description}</p>
                              <div className="mt-2 text-xs text-gray-500">
                                Pontos: {item.maxPoints}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={answer === true ? "default" : "outline"}
                                className={
                                  answer === true
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "hover:bg-green-50"
                                }
                                onClick={() => handleAnswer(item.id, true)}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Sim
                              </Button>
                              <Button
                                size="sm"
                                variant={answer === false ? "default" : "outline"}
                                className={
                                  answer === false
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "hover:bg-red-50"
                                }
                                onClick={() => handleAnswer(item.id, false)}
                              >
                                <Circle className="w-4 h-4 mr-1" />
                                Não
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
