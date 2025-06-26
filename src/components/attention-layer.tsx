"use client";

import type { FC } from 'react';
import type { NeuronTags, SelectedNeuron } from '@/types';
import HeatmapCell from './heatmap-cell';

interface AttentionLayerProps {
  layerIndex: number;
  tokens: string[];
  attention: number[][];
  tags: NeuronTags;
  selectedNeuron: SelectedNeuron;
  onTagUpdate: (key: string, name: string) => void;
  onNeuronClick: (layer: number, row: number, col: number) => void;
  setCellRef: (el: HTMLDivElement | null, id: string) => void;
}

const AttentionLayer: FC<AttentionLayerProps> = ({
  layerIndex,
  tokens,
  attention,
  tags,
  selectedNeuron,
  onTagUpdate,
  onNeuronClick,
  setCellRef,
}) => {
  return (
    <div className="p-4 overflow-auto">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `50px repeat(${tokens.length}, minmax(60px, 1fr))`,
          gridTemplateRows: `50px repeat(${tokens.length}, minmax(60px, 1fr))`,
        }}
      >
        {/* Top-left empty cell */}
        <div />
        {/* Column headers */}
        {tokens.map((token, i) => (
          <div key={`col-header-${i}`} className="flex items-center justify-center font-bold text-muted-foreground break-all text-xs p-1">
            {token}
          </div>
        ))}
        {/* Row headers and heatmap cells */}
        {tokens.map((token, rowIndex) => (
          <>
            <div key={`row-header-${rowIndex}`} className="flex items-center justify-center font-bold text-muted-foreground break-all text-xs p-1">
              {token}
            </div>
            {attention[rowIndex].map((weight, colIndex) => {
              const key = `l${layerIndex}-r${rowIndex}-c${colIndex}`;
              const isSelected = selectedNeuron?.layer === layerIndex && selectedNeuron?.row === rowIndex && selectedNeuron?.col === colIndex;

              return (
                <HeatmapCell
                  key={key}
                  cellRef={(el) => setCellRef(el, key)}
                  cellId={key}
                  layerIndex={layerIndex}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  weight={weight}
                  tag={tags[key]}
                  isSelected={isSelected}
                  onTagUpdate={onTagUpdate}
                  onCellClick={() => onNeuronClick(layerIndex, rowIndex, colIndex)}
                />
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
};

export default AttentionLayer;
