import MapView from './components/MapView';
import BottomBar from './components/BottomBar';
import FloatingButtons from './components/FloatingButtons';
import StatusBar from './components/StatusBar';
import Toast from './components/Toast';
import SearchBar from './components/SearchBar';

export default function App() {
  return (
    <>
      <MapView />
      <SearchBar />
      <StatusBar />
      <FloatingButtons />
      <BottomBar />
      <Toast />
    </>
  );
}
