export type AnalysisResult = {
  tokens: string[];
  attention: number[][][];
};

export type NeuronTag = {
  name: string;
};

export type NeuronTags = Record<string, NeuronTag>;

export type SelectedNeuron = {
  layer: number;
  row: number;
  col: number;
} | null;

export type Line = {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
