import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Award, Crown, Medal, TrendingUp, Trophy } from "lucide-react";
import { useState } from "react";

export default function Ranking() {
  const { user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);

  const { data: ranking } = trpc.ranking.get.useQuery({ region: selectedRegion });

  const getRankIcon = (position: number) => {
    if (position === 1) {
      return <Crown className="w-6 h-6 text-yellow-500" />;
    } else if (position === 2) {
      return <Medal className="w-6 h-6 text-gray-400" />;
    } else if (position === 3) {
      return <Medal className="w-6 h-6 text-orange-500" />;
    }
    return <span className="text-gray-600 font-semibold">{position}º</span>;
  };

  const getRankBadge = (position: number) => {
    if (position === 1) {
      return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    } else if (position === 2) {
      return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    } else if (position === 3) {
      return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
    } else if (position <= 10) {
      return "bg-green-100 text-green-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  const regions = [
    { value: undefined, label: "Nacional" },
    { value: "sul", label: "Sul" },
    { value: "sudeste", label: "Sudeste" },
    { value: "centro-oeste", label: "Centro-Oeste" },
    { value: "nordeste", label: "Nordeste" },
    { value: "norte", label: "Norte" },
  ];

  const userRank = ranking?.find((r: any) => r.farmId === user?.id);
  const top10 = ranking?.slice(0, 10) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-green-600" />
            Ranking de Produtores
          </h1>
          <p className="text-gray-600 mt-1">
            Veja sua posição e compare-se com outros produtores
          </p>
        </div>

        {/* Region Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filtrar por Região</CardTitle>
            <CardDescription>Escolha uma região para ver o ranking local</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => (
                <Button
                  key={region.label}
                  variant={selectedRegion === region.value ? "default" : "outline"}
                  className={
                    selectedRegion === region.value
                      ? "bg-green-600 hover:bg-green-700"
                      : "hover:bg-green-50"
                  }
                  onClick={() => setSelectedRegion(region.value)}
                >
                  {region.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Position Card */}
        {userRank && (
          <Card className="border-2 border-green-600 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Sua Posição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${getRankBadge(
                      userRank.position
                    )}`}
                  >
                    {userRank.position <= 3 ? (
                      getRankIcon(userRank.position)
                    ) : (
                      <span className="text-2xl font-bold">{userRank.position}º</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{userRank.farmName}</h3>
                    <p className="text-sm text-gray-600">{userRank.region}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{userRank.totalPoints}</div>
                  <div className="text-sm text-gray-600">pontos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 10 Ranking Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Produtores</CardTitle>
            <CardDescription>
              Os produtores com melhor desempenho em {selectedRegion ? regions.find(r => r.value === selectedRegion)?.label : "todo o país"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!ranking || ranking.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum produtor no ranking ainda.</p>
                <p className="text-sm mt-2">Complete desafios e ganhe pontos para aparecer aqui!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Posição</TableHead>
                    <TableHead>Produtor</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                    <TableHead className="text-right">Desafios</TableHead>
                    <TableHead className="text-right">Selo ESG</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {top10.map((entry: any, index: number) => {
                    const isCurrentUser = entry.farmId === user?.id;

                    return (
                      <TableRow
                        key={entry.farmId}
                        className={`${
                          isCurrentUser ? "bg-green-50 border-l-4 border-l-green-600" : ""
                        } ${index < 3 ? "font-semibold" : ""}`}
                      >
                        <TableCell>
                          <div
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${getRankBadge(
                              entry.position
                            )}`}
                          >
                            {entry.position <= 3 ? (
                              getRankIcon(entry.position)
                            ) : (
                              <span className="text-sm font-semibold">{entry.position}º</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={isCurrentUser ? "text-green-700 font-bold" : ""}>
                              {entry.farmName}
                            </span>
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 rounded text-xs bg-green-600 text-white">
                                Você
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">{entry.region}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="font-semibold text-gray-900">
                              {entry.totalPoints}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Award className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-700">{entry.challengesCompleted}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              entry.esgBadge === "Ouro"
                                ? "bg-yellow-100 text-yellow-700"
                                : entry.esgBadge === "Prata"
                                ? "bg-gray-100 text-gray-700"
                                : entry.esgBadge === "Bronze"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-50 text-gray-500"
                            }`}
                          >
                            {entry.esgBadge || "Sem Selo"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">Como subir no ranking?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Complete Desafios</h4>
                <p className="text-sm text-green-50">
                  Cada desafio concluído adiciona pontos ao seu total
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Trophy className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Conquiste Selos ESG</h4>
                <p className="text-sm text-green-50">
                  Selos de sustentabilidade aumentam sua pontuação
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Melhore suas Métricas</h4>
                <p className="text-sm text-green-50">
                  Produtividade, GMD e gestão financeira contam pontos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
