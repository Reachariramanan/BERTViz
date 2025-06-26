"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { NeuronTag } from '@/types';
import { PenSquare } from 'lucide-react';

interface HeatmapCellProps {
  cellId: string;
  layerIndex: number;
  rowIndex: number;
  colIndex: number;
  weight: number;
  tag?: NeuronTag;
  isSelected: boolean;
  onTagUpdate: (key: string, name: string) => void;
  onCellClick: () => void;
  cellRef: (el: HTMLDivElement | null) => void;
}

const HeatmapCell: FC<HeatmapCellProps> = ({
  cellId,
  weight,
  tag,
  isSelected,
  onTagUpdate,
  onCellClick,
  cellRef,
}) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [tagName, setTagName] = useState(tag?.name || '');

  const handleSave = () => {
    onTagUpdate(cellId, tagName);
    setDialogOpen(false);
  };

  const colorStyle = {
    backgroundColor: `hsl(var(--primary) / ${weight * 0.9 + 0.1})`,
  };

  const cellContent = (
    <div
      ref={cellRef}
      role="button"
      tabIndex={0}
      onClick={onCellClick}
      onKeyDown={(e) => e.key === 'Enter' && onCellClick()}
      className={cn(
        "group relative w-full h-full rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent",
        isSelected && "ring-2 ring-offset-2 ring-offset-background ring-accent"
      )}
      style={colorStyle}
    >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setTagName(tag?.name || '');
            setDialogOpen(true);
          }}
          className="absolute top-1 right-1 p-1 rounded-full bg-background/50 text-foreground/70 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          aria-label="Tag neuron"
        >
          <PenSquare className="w-4 h-4" />
        </button>
    </div>
  );

  return (
    <>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
          {tag && (
            <TooltipContent>
              <p className="font-bold">{tag.name}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tag Neuron</DialogTitle>
            <DialogDescription>
              Assign a descriptive name or purpose to this neuron. This is only stored locally.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="name"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="e.g., 'Connects nouns to verbs'"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeatmapCell;
