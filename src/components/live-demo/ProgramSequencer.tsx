import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, SkipForward, RotateCw, List } from "lucide-react";

interface ProgramStep {
  id: number;
  name: string;
  action: string;
  duration: number;
  targetPosition?: number;
  targetSpeed?: number;
}

interface ProgramSequencerProps {
  onStepChange: (position?: number, speed?: number) => void;
  isRunning: boolean;
  autoMode: boolean;
}

const PROGRAMS: { [key: string]: ProgramStep[] } = {
  'cycle-test': [
    { id: 1, name: 'Initialize', action: 'Move to home position', duration: 3, targetPosition: 0, targetSpeed: 30 },
    { id: 2, name: 'Move Forward', action: 'Move to position 100%', duration: 5, targetPosition: 100, targetSpeed: 60 },
    { id: 3, name: 'Hold', action: 'Hold position', duration: 2, targetPosition: 100, targetSpeed: 0 },
    { id: 4, name: 'Return', action: 'Return to home', duration: 5, targetPosition: 0, targetSpeed: 60 },
    { id: 5, name: 'Complete', action: 'Cycle complete', duration: 1, targetPosition: 0, targetSpeed: 0 },
  ],
  'pick-place': [
    { id: 1, name: 'Start', action: 'Move to pickup position', duration: 3, targetPosition: 25, targetSpeed: 50 },
    { id: 2, name: 'Pickup', action: 'Engage gripper', duration: 2, targetPosition: 25, targetSpeed: 0 },
    { id: 3, name: 'Lift', action: 'Lift object', duration: 2, targetPosition: 30, targetSpeed: 20 },
    { id: 4, name: 'Transport', action: 'Move to drop position', duration: 4, targetPosition: 75, targetSpeed: 60 },
    { id: 5, name: 'Lower', action: 'Lower object', duration: 2, targetPosition: 70, targetSpeed: 20 },
    { id: 6, name: 'Release', action: 'Release gripper', duration: 1, targetPosition: 70, targetSpeed: 0 },
    { id: 7, name: 'Return', action: 'Return to start', duration: 4, targetPosition: 0, targetSpeed: 60 },
  ],
  'quality-check': [
    { id: 1, name: 'Position 1', action: 'Check point 1', duration: 3, targetPosition: 20, targetSpeed: 40 },
    { id: 2, name: 'Scan', action: 'Perform scan', duration: 2, targetPosition: 20, targetSpeed: 0 },
    { id: 3, name: 'Position 2', action: 'Check point 2', duration: 3, targetPosition: 50, targetSpeed: 40 },
    { id: 4, name: 'Scan', action: 'Perform scan', duration: 2, targetPosition: 50, targetSpeed: 0 },
    { id: 5, name: 'Position 3', action: 'Check point 3', duration: 3, targetPosition: 80, targetSpeed: 40 },
    { id: 6, name: 'Scan', action: 'Perform scan', duration: 2, targetPosition: 80, targetSpeed: 0 },
    { id: 7, name: 'Complete', action: 'Return home', duration: 4, targetPosition: 0, targetSpeed: 60 },
  ],
};

export const ProgramSequencer = ({ onStepChange, isRunning, autoMode }: ProgramSequencerProps) => {
  const [selectedProgram, setSelectedProgram] = useState<string>('cycle-test');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [stepProgress, setStepProgress] = useState<number>(0);
  const [isProgramRunning, setIsProgramRunning] = useState<boolean>(false);
  const [cycleCount, setCycleCount] = useState<number>(0);

  const currentProgram = PROGRAMS[selectedProgram];
  const currentStep = currentProgram[currentStepIndex];

  useEffect(() => {
    if (isProgramRunning && autoMode) {
      const interval = setInterval(() => {
        setStepProgress(prev => {
          const newProgress = prev + (100 / (currentStep.duration * 10));
          
          if (newProgress >= 100) {
            // Move to next step
            if (currentStepIndex < currentProgram.length - 1) {
              setCurrentStepIndex(prev => prev + 1);
              return 0;
            } else {
              // Program complete, restart
              setCurrentStepIndex(0);
              setCycleCount(prev => prev + 1);
              return 0;
            }
          }
          
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isProgramRunning, autoMode, currentStepIndex, currentProgram.length, currentStep.duration]);

  useEffect(() => {
    if (isProgramRunning && currentStep) {
      onStepChange(currentStep.targetPosition, currentStep.targetSpeed);
    }
  }, [currentStep, isProgramRunning]);

  const startProgram = () => {
    setIsProgramRunning(true);
    setCurrentStepIndex(0);
    setStepProgress(0);
  };

  const pauseProgram = () => {
    setIsProgramRunning(false);
  };

  const nextStep = () => {
    if (currentStepIndex < currentProgram.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setStepProgress(0);
    }
  };

  const resetProgram = () => {
    setIsProgramRunning(false);
    setCurrentStepIndex(0);
    setStepProgress(0);
    setCycleCount(0);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-white">
            <List className="w-5 h-5 mr-2" />
            Program Sequencer
          </CardTitle>
          <Badge variant={isProgramRunning ? "default" : "secondary"}>
            {isProgramRunning ? 'Running' : 'Idle'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Program Selection */}
        <div>
          <label className="text-sm text-slate-300 mb-2 block">Select Program</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(PROGRAMS).map(programKey => (
              <Button
                key={programKey}
                size="sm"
                variant={selectedProgram === programKey ? "default" : "outline"}
                onClick={() => {
                  setSelectedProgram(programKey);
                  resetProgram();
                }}
                className="text-xs"
                disabled={isProgramRunning}
              >
                {programKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            size="sm"
            onClick={startProgram}
            disabled={!autoMode || isProgramRunning}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={pauseProgram}
            disabled={!isProgramRunning}
            variant="outline"
            className="border-slate-600 text-white"
          >
            <Pause className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={nextStep}
            disabled={!isProgramRunning}
            variant="outline"
            className="border-slate-600 text-white"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={resetProgram}
            variant="outline"
            className="border-slate-600 text-white"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Current Step Display */}
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">
              Step {currentStepIndex + 1} of {currentProgram.length}
            </span>
            <Badge variant="secondary">
              {currentStep.name}
            </Badge>
          </div>
          <p className="text-sm text-slate-300 mb-3">{currentStep.action}</p>
          <Progress value={stepProgress} className="h-2" />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>{(stepProgress / 100 * currentStep.duration).toFixed(1)}s</span>
            <span>{currentStep.duration}s</span>
          </div>
        </div>

        {/* Cycle Counter */}
        <div className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
          <span className="text-slate-300">Cycles Completed</span>
          <Badge variant="default" className="text-lg px-3 py-1">
            {cycleCount}
          </Badge>
        </div>

        {/* Program Steps List */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">Program Steps</h4>
          <ScrollArea className="h-[200px] pr-2">
            <div className="space-y-1">
              {currentProgram.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-2 rounded text-sm ${
                    index === currentStepIndex && isProgramRunning
                      ? 'bg-primary/20 border border-primary'
                      : index < currentStepIndex && isProgramRunning
                      ? 'bg-green-900/20 border border-green-800'
                      : 'bg-slate-700/30 border border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white">{step.id}. {step.name}</span>
                    <span className="text-slate-400 text-xs">{step.duration}s</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{step.action}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {!autoMode && (
          <div className="bg-yellow-900/20 border border-yellow-800 p-3 rounded-lg">
            <p className="text-yellow-400 text-sm">
              Enable Auto Mode in the control panel to run programs
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
