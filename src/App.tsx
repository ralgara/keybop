import { GameContextProvider } from './context/GameContext';
import { useGameState } from './hooks/useGameState';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import './App.css';

function AppContent() {
  const { status } = useGameState();

  switch (status) {
    case 'menu':
      return <MainMenu />;
    case 'playing':
    case 'paused':
      return <GameScreen />;
    case 'finished':
      return <ResultsScreen />;
    default:
      return <MainMenu />;
  }
}

function App() {
  return (
    <GameContextProvider>
      <div className="app">
        <AppContent />
      </div>
    </GameContextProvider>
  );
}

export default App;
