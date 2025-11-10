import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Loader2, Leaf, Award, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ESG() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: farms } = trpc.farms.list.useQuery(undefined, { enabled: isAuthenticated });
  const farm = farms?.[0];
  
  const { data: checklists, isLoading } = trpc.esg.listChecklists.useQuery(undefined, { enabled: isAuthenticated });
  const { data: responses } = trpc.esg.listResponses.useQuery({ farmId: farm?.id || 0 }, { enabled: !!farm });
  const { data: score } = trpc.esg.calculateScore.useQuery({ farmId: farm?.id || 0 }, { enabled: !!farm });

  const saveResponse = trpc.esg.saveResponse.useMutation({
    onSuccess: () => {
      toast.success("Resposta salva!");
    },
  });

  if (!isAuthenticated || !farm) {
    setLocation("/");
    return null;
  }

  const getResponse = (checklistId: number) => {
    return responses?.find(r => r.checklistId === checklistId);
  };

  const handleCheckboxChange = (checklistId: number, checked: boolean) => {
    saveResponse.mutate({
      checklistId,
      farmId: farm.id,
      response: checked,
      pointsObtained: checked ? 10 : 0,
    });
  };

  const getBadgeLevel = (percentage: number) => {
    if (percentage >= 80) return { level: 'Ouro', icon: '🥇', color: 'text-yellow-600' };
    if (percentage >= 60) return { level: 'Prata', icon: '🥈', color: 'text-gray-400' };
    if (percentage >= 40) return { level: 'Bronze', icon: '🥉', color: 'text-orange-600' };
    return { level: 'Sem Selo', icon: '', color: 'text-muted-foreground' };
  };

  const badge = getBadgeLevel(score?.percentage || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Avaliação ESG</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                Score ESG
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-green-600 mb-4">{score?.percentage || 0}%</div>
              <Progress value={score?.percentage || 0} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {score?.score || 0} de {score?.maxScore || 0} pontos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Selo Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-5xl mb-2`}>{badge.icon}</div>
              <div className={`text-3xl font-bold ${badge.color}`}>{badge.level}</div>
              <p className="text-sm text-muted-foreground mt-2">
                {badge.level === 'Ouro' ? 'Excelente!' : badge.level === 'Prata' ? 'Muito bom!' : badge.level === 'Bronze' ? 'Bom!' : 'Continue melhorando!'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Checklist de Práticas Sustentáveis</CardTitle>
            <CardDescription>Marque as práticas que sua fazenda adota</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : checklists && checklists.length > 0 ? (
              <div className="space-y-4">
                {checklists.map((checklist: any) => {
                  const response = getResponse(checklist.id);
                  return (
                    <div key={checklist.id} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <Checkbox
                        id={`checklist-${checklist.id}`}
                        checked={response?.response || false}
                        onCheckedChange={(checked) => handleCheckboxChange(checklist.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <label htmlFor={`checklist-${checklist.id}`} className="font-medium cursor-pointer">
                          {checklist.title}
                        </label>
                        {checklist.description && (
                          <p className="text-sm text-muted-foreground mt-1">{checklist.description}</p>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {checklist.category} • {checklist.maxPoints} pontos
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum checklist disponível ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
