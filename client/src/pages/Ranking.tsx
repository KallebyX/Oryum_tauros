import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Medal, Award, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Ranking() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: farms } = trpc.farms.list.useQuery(undefined, { enabled: isAuthenticated });
  const myFarm = farms?.[0];
  
  const { data: ranking, isLoading } = trpc.ranking.getTop.useQuery({ limit: 10 }, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (position === 3) return <Award className="w-5 h-5 text-orange-600" />;
    return null;
  };

  const myPosition = ranking?.findIndex(r => r.farmId === myFarm?.id) ?? -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Ranking Regional</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {myFarm && myPosition >= 0 && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle>Sua Posição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-primary">#{myPosition + 1}</div>
                  <p className="text-muted-foreground">{myFarm.name}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{ranking?.[myPosition]?.score || 0}</div>
                  <p className="text-sm text-muted-foreground">pontos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Top Produtores</CardTitle>
            <CardDescription>Ranking baseado em pontos ESG e desafios</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : ranking && ranking.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Posição</TableHead>
                    <TableHead>Fazenda</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead>Selo ESG</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((entry, index) => {
                    const isMyFarm = entry.farmId === myFarm?.id;
                    return (
                      <TableRow key={entry.farmId} className={isMyFarm ? 'bg-primary/10' : ''}>
                        <TableCell className="font-bold">
                          <div className="flex items-center gap-2">
                            {getPositionIcon(index + 1)}
                            #{index + 1}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {entry.farmName}
                          {isMyFarm && <Badge variant="outline" className="ml-2">Você</Badge>}
                        </TableCell>
                        <TableCell>{entry.region}</TableCell>
                        <TableCell>
                          {entry.badgeLevel === 'gold' && <Badge className="bg-yellow-500">🥇 Ouro</Badge>}
                          {entry.badgeLevel === 'silver' && <Badge className="bg-gray-400">🥈 Prata</Badge>}
                          {entry.badgeLevel === 'bronze' && <Badge className="bg-orange-600">🥉 Bronze</Badge>}
                          {!entry.badgeLevel && <Badge variant="secondary">Sem selo</Badge>}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {entry.score}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado de ranking disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
