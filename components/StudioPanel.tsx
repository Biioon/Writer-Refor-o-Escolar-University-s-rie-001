import React, { useState } from 'react';
import { StudioView, BackgroundStyle } from '../types';
import { Bot, Package, Calculator, Map, BookOpen } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';

interface StudioPanelProps {
  currentView: StudioView;
  backgroundStyle: BackgroundStyle;
}

const DefaultView: React.FC = () => (
    <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full z-10">
        <div className="mb-6 perspective-1000">
          <BookOpen 
            size={64} 
            className="text-[var(--color-primary)] animate-float animate-spin-3d shadow-2xl shadow-[var(--color-primary)]/40" 
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-300">Aqui é seu espaço Visual</h2>
        <p className="mt-2 text-sm">Descreva suas tarefas no chat para começar.</p>
    </div>
);

const CalculatorView: React.FC = () => {
    const [display, setDisplay] = useState('0');
    const [currentValue, setCurrentValue] = useState<string | null>(null);
    const [previousValue, setPreviousValue] = useState<string | null>(null);
    const [operator, setOperator] = useState<string | null>(null);

    const handleButtonClick = (value: string) => {
        if (!isNaN(Number(value))) { // Is a number
            if (display === '0' || currentValue === null) {
                setDisplay(value);
                setCurrentValue(value);
            } else {
                const newValue = currentValue + value;
                setDisplay(newValue);
                setCurrentValue(newValue);
            }
        } else if (value === '.') {
            if (currentValue && !currentValue.includes('.')) {
                const newValue = currentValue + '.';
                setDisplay(newValue);
                setCurrentValue(newValue);
            } else if (!currentValue) {
                setDisplay('0.');
                setCurrentValue('0.');
            }
        } else if (['+', '-', '×', '÷'].includes(value)) { // Is an operator
            if (currentValue !== null) {
                setPreviousValue(currentValue);
            }
            setCurrentValue(null);
            setOperator(value);
        } else if (value === '=') {
            if (previousValue && operator && currentValue) {
                const prev = parseFloat(previousValue);
                const curr = parseFloat(currentValue);
                let result: number;
                switch (operator) {
                    case '+': result = prev + curr; break;
                    case '-': result = prev - curr; break;
                    case '×': result = prev * curr; break;
                    case '÷': result = prev / curr; break;
                    default: return;
                }
                const resultString = String(result);
                setDisplay(resultString);
                setCurrentValue(resultString);
                setPreviousValue(null);
                setOperator(null);
            }
        } else if (value === 'AC') {
            setDisplay('0');
            setCurrentValue(null);
            setPreviousValue(null);
            setOperator(null);
        } else if (value === '±') {
            if (currentValue) {
                const negated = String(parseFloat(currentValue) * -1);
                setDisplay(negated);
                setCurrentValue(negated);
            }
        } else if (value === '%') {
            if (currentValue) {
                const percentage = String(parseFloat(currentValue) / 100);
                setDisplay(percentage);
                setCurrentValue(percentage);
            }
        }
    };
    
    const buttons = [
      'AC', '±', '%', '÷',
      '7', '8', '9', '×',
      '4', '5', '6', '-',
      '1', '2', '3', '+',
      '0', '.', '='
    ];

    const getButtonClass = (btn: string) => {
        if (['÷', '×', '-', '+', '='].includes(btn)) return 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white';
        if (['AC', '±', '%'].includes(btn)) return 'bg-stone-600 hover:bg-stone-500 text-gray-200';
        return 'bg-stone-700 hover:bg-stone-600 text-gray-200';
    };

    return (
        <div className="w-full max-w-xs mx-auto p-4 bg-stone-900/50 backdrop-blur-sm rounded-2xl border border-stone-800 shadow-2xl z-10">
            <div className="bg-stone-800 rounded-lg p-4 mb-4 text-right text-4xl font-mono text-white break-all">{display}</div>
            <div className="grid grid-cols-4 gap-2">
                {buttons.map(btn => (
                    <button 
                        key={btn} 
                        onClick={() => handleButtonClick(btn)}
                        className={`p-4 rounded-lg text-xl font-bold transition-colors ${getButtonClass(btn)} ${btn === '0' ? 'col-span-2' : ''}`}
                    >
                        {btn}
                    </button>
                ))}
            </div>
        </div>
    );
};


const MapView: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 z-10">
        <Map size={64} className="mb-4 text-[var(--color-accent)]"/>
        <h3 className="text-2xl font-bold">Mapa Interativo</h3>
        <p>Explorando o mundo da Geografia!</p>
        <img src="https://picsum.photos/seed/map/600/400" alt="Mapa" className="mt-4 rounded-lg shadow-lg border-2 border-stone-700"/>
    </div>
);

const EbookView: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 z-10">
        <BookOpen size={64} className="mb-4 text-[var(--color-accent)]"/>
        <h3 className="text-2xl font-bold">E-book Ilustrado de Ciências</h3>
        <p>Descobrindo os segredos da natureza.</p>
        <img src="https://picsum.photos/seed/ebook/600/400" alt="E-book" className="mt-4 rounded-lg shadow-lg border-2 border-stone-700"/>
    </div>
);

const StudioPanel: React.FC<StudioPanelProps> = ({ currentView, backgroundStyle }) => {
  const renderView = () => {
    switch (currentView) {
      case 'calculator':
        return <CalculatorView />;
      case 'map':
        return <MapView />;
      case 'ebook':
        return <EbookView />;
      case 'default':
      default:
        return <DefaultView />;
    }
  };

  return (
    <div className="flex-1 p-6 flex items-center justify-center relative overflow-hidden bg-black">
      <AnimatedBackground style={backgroundStyle} />
      <div className="w-full h-full flex items-center justify-center">
        {renderView()}
      </div>
    </div>
  );
};

export default StudioPanel;