import { GameContextProvider } from './context/GameContext.tsx';
import { MainMenu } from './components/MainMenu.tsx';
import { GameScreen } from './components/GameScreen.tsx';
import { ResultsScreen } from './components/ResultsScreen.tsx';
import { useGameState } from './hooks/useGameState.ts';
import './App.css';

function AppContent() {
  const { state } = useGameState();

  switch (state.status) {
    case 'menu':
      return <MainMenu />;
    case 'playing':
    case 'paused':
      return <GameScreen />;
    case 'finished':
      return <ResultsScreen />;
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
