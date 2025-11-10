import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { skipToken } from "@tanstack/react-query";
import { Award, Calendar, CheckCircle2, Clock, Target, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function Challenges() {
  const { user } = useAuth();
  const farmId = user?.id;

  const { data: challenges, refetch: refetchChallenges } = trpc.challenges.list.useQuery(
    farmId ? { farmId } : skipToken
  );

  const { data: progress, refetch: refetchProgress } = trpc.challenges.listProgress.useQuery(
    farmId ? { farmId } : skipToken
  );

  const startChallenge = trpc.challenges.start.useMutation({
    onSuccess: () => {
      toast.success("Desafio iniciado!");
      refetchProgress();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const completeChallenge = trpc.challenges.complete.useMutation({
    onSuccess: () => {
      toast.success("Parabéns! Desafio concluído! 🎉");
      refetchProgress();
      refetchChallenges();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleStartChallenge = (challengeId: number) => {
    if (!farmId) {
      toast.error("Fazenda não identificada");
      return;
    }

    startChallenge.mutate({
      farmId,
      challengeId,
    });
  };

  const handleCompleteChallenge = (challengeId: number) => {
    if (!farmId) {
      toast.error("Fazenda não identificada");
      return;
    }

    completeChallenge.mutate({
      farmId,
      challengeId,
    });
  };

  const getChallengeProgress = (challengeId: number) => {
    return progress?.find((p: any) => p.challengeId === challengeId);
  };

  const getProgressPercentage = (challengeProgress: any, challenge: any) => {
    if (!challengeProgress || !challenge) return 0;
    return challengeProgress.progressPercent || 0;
  };

  const getDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      financial: "Financeiro",
      esg: "ESG",
      production: "Produção",
      management: "Gestão",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      financial: "bg-blue-100 text-blue-700",
      esg: "bg-green-100 text-green-700",
      production: "bg-orange-100 text-orange-700",
      management: "bg-purple-100 text-purple-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  const completedCount = progress?.filter((p: any) => p.completed).length || 0;
  const totalChallenges = challenges?.length || 0;
  const totalPoints = progress?.reduce((sum: number, p: any) => sum + (p.completed ? p.pointsEarned : 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-green-600" />
            Desafios e Missões
          </h1>
          <p className="text-gray-600 mt-1">
            Complete desafios e ganhe pontos para subir no ranking
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Desafios Concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {completedCount}/{totalChallenges}
              </div>
              <Progress
                value={totalChallenges > 0 ? (completedCount / totalChallenges) * 100 : 0}
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pontos Ganhos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{totalPoints}</div>
              <p className="text-sm text-gray-600 mt-1">pontos acumulados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Desafios Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {progress?.filter((p: any) => !p.completed).length || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">em andamento</p>
            </CardContent>
          </Card>
        </div>

        {/* Challenges List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Desafios Disponíveis</h2>

          {!challenges || challenges.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum desafio disponível no momento.</p>
                <p className="text-sm mt-2">Novos desafios são adicionados mensalmente!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map((challenge: any) => {
                const challengeProgress = getChallengeProgress(challenge.id);
                const progressPercentage = getProgressPercentage(challengeProgress, challenge);
                const daysRemaining = getDaysRemaining(challenge.endDate);
                const isCompleted = challengeProgress?.completed || false;
                const isStarted = !!challengeProgress;

                return (
                  <Card
                    key={challenge.id}
                    className={`${
                      isCompleted
                        ? "border-green-500 border-2 bg-green-50"
                        : isStarted
                        ? "border-blue-500 border-2"
                        : "border-gray-200"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(
                                challenge.category
                              )}`}
                            >
                              {getCategoryLabel(challenge.category)}
                            </span>
                            {isCompleted && (
                              <span className="px-2 py-1 rounded text-xs font-semibold bg-green-600 text-white flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Concluído
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-xl">{challenge.title}</CardTitle>
                          <CardDescription className="mt-2">{challenge.description}</CardDescription>
                        </div>
                        <Award className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Progress */}
                      {isStarted && !isCompleted && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Progresso</span>
                            <span>
                              {challengeProgress.progressPercent}% completo
                            </span>
                          </div>
                          <Progress value={progressPercentage} className="h-3" />
                          <div className="text-xs text-gray-500 text-right">
                            {progressPercentage}% concluído
                          </div>
                        </div>
                      )}

                      {/* Info */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold">{challenge.points} pontos</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {daysRemaining > 0 ? (
                            <>
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span>{daysRemaining} dias restantes</span>
                            </>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4 text-red-500" />
                              <span className="text-red-600">Expirado</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t">
                        {isCompleted ? (
                          <div className="text-center text-green-600 font-semibold flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Desafio Concluído! +{challenge.points} pontos
                          </div>
                        ) : isStarted ? (
                          <div className="space-y-2">
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => handleCompleteChallenge(challenge.id)}
                              disabled={progressPercentage < 100}
                            >
                              {progressPercentage >= 100 ? "Concluir Desafio" : "Em Andamento"}
                            </Button>
                            {progressPercentage < 100 && (
                              <p className="text-xs text-center text-gray-500">
                                Complete o objetivo para finalizar o desafio
                              </p>
                            )}
                          </div>
                        ) : (
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleStartChallenge(challenge.id)}
                            disabled={daysRemaining === 0}
                          >
                            {daysRemaining > 0 ? "Iniciar Desafio" : "Desafio Expirado"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
