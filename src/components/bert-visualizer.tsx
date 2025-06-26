"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { AnalysisResult, NeuronTags, SelectedNeuron, Line } from '@/types';
import AttentionLayer from './attention-layer';
import { Sparkles, Zap } from 'lucide-react';

const NUM_LAYERS = 4;
const TOP_K = 3;

const generateMockData = (sentence: string): AnalysisResult => {
  const tokens = sentence.trim().split(/\s+/).filter(Boolean);
  const attention = Array.from({ length: NUM_LAYERS }, () =>
    Array.from({ length: tokens.length }, () =>
      Array.from({ length: tokens.length }, () => Math.random())
    )
  );
  return { tokens, attention };
};

export default function BertVisualizer() {
  const [sentence, setSentence] = useState('BERT helps visualize attention');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [neuronTags, setNeuronTags] = useState<NeuronTags>({});
  const [selectedNeuron, setSelectedNeuron] = useState<SelectedNeuron>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const { toast } = useToast();

  const visualizationContainerRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const setCellRef = useCallback((el: HTMLDivElement | null, id: string) => {
    cellRefs.current[id] = el;
  }, []);

  const handleAnalyze = () => {
    const result = generateMockData(sentence);
    setAnalysisResult(result);
    setNeuronTags({});
    setSelectedNeuron(null);
    setLines([]);
  };

  useEffect(() => {
    handleAnalyze();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTagUpdate = (key: string, name: string) => {
    setNeuronTags((prev) => ({ ...prev, [key]: { name } }));
    toast({
      title: "Neuron Tagged!",
      description: `Neuron has been tagged as "${name}".`,
    });
  };

  const calculateLines = useCallback(() => {
    if (!selectedNeuron || !analysisResult) {
      setLines([]);
      return;
    }
    
    const containerRect = visualizationContainerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const { layer, row, col } = selectedNeuron;
    if (layer >= analysisResult.attention.length - 1) {
      setLines([]);
      return;
    }

    const sourceId = `l${layer}-r${row}-c${col}`;
    const sourceEl = cellRefs.current[sourceId];
    if (!sourceEl) return;

    const sourceRect = sourceEl.getBoundingClientRect();
    const sourceX = sourceRect.left - containerRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top - containerRect.top + sourceRect.height / 2;

    const nextLayerWeights = analysisResult.attention[layer + 1][row];
    const topKIndices = nextLayerWeights
      .map((weight, index) => ({ weight, index }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, TOP_K)
      .map(d => d.index);

    const newLines = topKIndices.map(targetCol => {
      const targetId = `l${layer + 1}-r${row}-c${targetCol}`;
      const targetEl = cellRefs.current[targetId];
      if (!targetEl) return null;

      const targetRect = targetEl.getBoundingClientRect();
      const targetX = targetRect.left - containerRect.left + targetRect.width / 2;
      const targetY = targetRect.top - containerRect.top + targetRect.height / 2;
      
      return { key: `${sourceId}-${targetId}`, x1: sourceX, y1: sourceY, x2: targetX, y2: targetY };
    }).filter((line): line is Line => line !== null);

    setLines(newLines);
  }, [selectedNeuron, analysisResult]);


  useEffect(() => {
    calculateLines();
    window.addEventListener('resize', calculateLines);
    return () => window.removeEventListener('resize', calculateLines);
  }, [calculateLines]);
  
  const handleNeuronClick = (layer: number, row: number, col: number) => {
    setSelectedNeuron({ layer, row, col });
  };
  

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-2">
          BERTviz Explorer
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          An interactive tool to visualize BERT's attention mechanisms. Input a sentence, see the heatmaps, tag neurons, and trace activation paths.
        </p>
      </header>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2 text-2xl">
            <Sparkles className="text-primary" />
            Input Sentence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder="Enter a sentence to visualize..."
              className="flex-grow text-base"
              rows={3}
            />
            <Button onClick={handleAnalyze} size="lg" className="font-bold">
              <Zap className="mr-2 h-5 w-5" />
              Visualize
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysisResult && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Attention Heatmaps</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="layer-0" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                {Array.from({ length: NUM_LAYERS }, (_, i) => (
                  <TabsTrigger key={`tab-trigger-${i}`} value={`layer-${i}`}>
                    Layer {i + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div ref={visualizationContainerRef} className="relative">
                {analysisResult.attention.map((layerData, i) => (
                  <TabsContent key={`tab-content-${i}`} value={`layer-${i}`}>
                    <AttentionLayer
                      layerIndex={i}
                      tokens={analysisResult.tokens}
                      attention={layerData}
                      tags={neuronTags}
                      selectedNeuron={selectedNeuron}
                      onTagUpdate={handleTagUpdate}
                      onNeuronClick={handleNeuronClick}
                      setCellRef={setCellRef}
                    />
                  </TabsContent>
                ))}
                 <svg
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ opacity: lines.length > 0 ? 1 : 0, transition: 'opacity 0.3s' }}
                  >
                    {lines.map(line => (
                      <line
                        key={line.key}
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        stroke="hsl(var(--accent))"
                        strokeWidth="2.5"
                        strokeDasharray="5,5"
                        markerEnd="url(#arrow)"
                      />
                    ))}
                     <defs>
                      <marker
                        id="arrow"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--accent))" />
                      </marker>
                    </defs>
                  </svg>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
