import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type ReportType = "financial" | "esg" | "production";

export default function Reports() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState<ReportType>("financial");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isDownloading, setIsDownloading] = useState(false);

  const farmId = user?.id || 1;

  const handleDownload = async () => {
    if (!reportType) {
      toast.error("Selecione o tipo de relatório");
      return;
    }

    setIsDownloading(true);

    try {
      let downloadUrl = "";

      switch (reportType) {
        case "financial":
          const startParam = startDate ? format(startDate, "yyyy-MM-dd") : "";
          const endParam = endDate ? format(endDate, "yyyy-MM-dd") : "";
          downloadUrl = `/api/reports/financial/${farmId}?start=${startParam}&end=${endParam}`;
          break;

        case "esg":
          downloadUrl = `/api/reports/esg/${farmId}`;
          break;

        case "production":
          downloadUrl = `/api/reports/production/${farmId}`;
          break;
      }

      // Abrir URL em nova aba para download
      window.open(downloadUrl, "_blank");
      
      toast.success("Relatório gerado com sucesso!");
    } catch (error: any) {
      console.error("Error downloading report:", error);
      toast.error("Erro ao gerar relatório");
    } finally {
      setIsDownloading(false);
    }
  };

  const reportDescriptions: Record<ReportType, string> = {
    financial: "Relatório completo de receitas, despesas e transações do período selecionado",
    esg: "Relatório de práticas ESG implementadas, score atual e sugestões de melhoria",
    production: "Relatório de produção com dados de GMD, produção de leite e pesagens",
  };

  const reportIcons: Record<ReportType, React.ReactNode> = {
    financial: <FileText className="h-12 w-12 text-green-600" />,
    esg: <FileText className="h-12 w-12 text-blue-600" />,
    production: <FileText className="h-12 w-12 text-orange-600" />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Relatórios</h1>
          <p className="text-gray-600">
            Gere relatórios em PDF para análise e compartilhamento
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Gerar Relatório</CardTitle>
            <CardDescription>
              Selecione o tipo de relatório e o período desejado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tipo de Relatório */}
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select
                value={reportType}
                onValueChange={(value) => setReportType(value as ReportType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Relatório Financeiro</SelectItem>
                  <SelectItem value="esg">Relatório ESG</SelectItem>
                  <SelectItem value="production">Relatório de Produção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview do Relatório */}
            {reportType && (
              <Card className="bg-gray-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">{reportIcons[reportType]}</div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {reportType === "financial" && "Relatório Financeiro"}
                        {reportType === "esg" && "Relatório ESG"}
                        {reportType === "production" && "Relatório de Produção"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {reportDescriptions[reportType]}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Período (apenas para relatório financeiro) */}
            {reportType === "financial" && (
              <div className="space-y-4">
                <Label>Período (Opcional)</Label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Data Início */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Data Início</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? (
                            format(startDate, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Data Fim */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Data Fim</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? (
                            format(endDate, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {!startDate && !endDate && (
                  <p className="text-sm text-gray-500">
                    Se não selecionar período, será gerado relatório dos últimos 30 dias
                  </p>
                )}
              </div>
            )}

            {/* Botão de Download */}
            <div className="pt-4">
              <Button
                onClick={handleDownload}
                disabled={isDownloading || !reportType}
                className="w-full"
                size="lg"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando Relatório...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Relatório PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Relatórios Recentes */}
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle>Relatórios Disponíveis</CardTitle>
            <CardDescription>
              Acesso rápido aos tipos de relatórios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 hover:bg-green-50"
                onClick={() => setReportType("financial")}
              >
                <FileText className="h-8 w-8 text-green-600 mb-2" />
                <div className="text-left">
                  <div className="font-semibold">Financeiro</div>
                  <div className="text-xs text-gray-500">Receitas e despesas</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 hover:bg-blue-50"
                onClick={() => setReportType("esg")}
              >
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <div className="text-left">
                  <div className="font-semibold">ESG</div>
                  <div className="text-xs text-gray-500">Práticas sustentáveis</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 hover:bg-orange-50"
                onClick={() => setReportType("production")}
              >
                <FileText className="h-8 w-8 text-orange-600 mb-2" />
                <div className="text-left">
                  <div className="font-semibold">Produção</div>
                  <div className="text-xs text-gray-500">GMD e leite</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
