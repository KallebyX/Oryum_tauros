import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, Trophy, Calendar, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Challenges() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: farms } = trpc.farms.list.useQuery(undefined, { enabled: isAuthenticated });
  const farm = farms?.[0];
  
  const { data: challenges, isLoading } = trpc.challenges.listActive.useQuery(undefined, { enabled: isAuthenticated });
  const { data: progress } = trpc.challenges.getProgress.useQuery({ farmId: farm?.id || 0 }, { enabled: !!farm });

  if (!isAuthenticated || !farm) {
    setLocation("/");
    return null;
  }

  const getProgressForChallenge = (challengeId: number) => {
    return progress?.find(p => p.challengeId === challengeId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Desafios e Missões</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Seus Pontos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-primary">
              {progress?.reduce((sum, p) => sum + (p.pointsEarned || 0), 0) || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {progress?.filter(p => p.completed).length || 0} desafios completados
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="flex justify-center py-8 col-span-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : challenges && challenges.length > 0 ? (
            challenges.map((challenge) => {
              const challengeProgress = getProgressForChallenge(challenge.id);
              const progressPercent = challengeProgress?.progressPercent || 0;
              const isCompleted = challengeProgress?.completed || false;

              return (
                <Card key={challenge.id} className={isCompleted ? 'border-green-500 bg-green-50' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        {challenge.title}
                      </CardTitle>
                      {isCompleted && <Badge variant="default">Completo!</Badge>}
                    </div>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progresso</span>
                          <span className="font-medium">{progressPercent}%</span>
                        </div>
                        <Progress value={progressPercent} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Até {new Date(challenge.endDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="font-bold text-primary">
                          +{challenge.points} pontos
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground col-span-2">
              Nenhum desafio ativo no momento
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
