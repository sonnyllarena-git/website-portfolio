import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageNavProvider, usePageNav } from './context/PageContext';
import { SoundProvider } from './context/SoundContext';
import { RobotPositionProvider } from './context/RobotPositionContext';
import { KeycapAvoidanceProvider } from './context/KeycapAvoidanceContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CursorOrb from './components/CursorOrb';
import EntryGate from './components/EntryGate/EntryGate';
import SceneCanvas from './components/Scene/SceneCanvas';
import KeyPhysicsOverlay from './components/KeyPhysicsOverlay';
import RoamingRobot from './components/RoamingRobot/RoamingRobot';
import StoreScreen from './components/Store/StoreScreen';
import Chatbot from './components/chat/Chatbot';

function AppShell() {
  const { activePage, direction, storeOpen, closeStore } = usePageNav();
  const roamingRobotRef = useRef(null);
  const [keycapEpoch, setKeycapEpoch] = useState(0);
  const isFirstPageRef = useRef(true);

  useEffect(() => {
    if (isFirstPageRef.current) {
      isFirstPageRef.current = false;
      return;
    }
    if (direction === 'forward') {
      setKeycapEpoch((epoch) => epoch + 1);
    }
  }, [activePage, direction]);

  const handleRequestOpen = (openNow) => {
    const button = document.querySelector('[data-chat-launcher]');
    const rect = button?.getBoundingClientRect();
    const px = rect ? rect.left + rect.width / 2 : window.innerWidth - 50;
    const py = rect ? rect.top + rect.height / 2 : window.innerHeight - 50;
    roamingRobotRef.current?.fireLaserAt(px, py, openNow);
  };

  const handleChatMessageSent = (text, role) => {
    if (role !== 'bot') return;
    roamingRobotRef.current?.showMessage(text);
  };

  return (
    <div className="min-h-screen text-white relative">
      <EntryGate />
      <CursorOrb />
      <Navbar />

      <AnimatePresence mode="wait">
        {storeOpen ? (
          <motion.div
            key="store"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <StoreScreen onBack={closeStore} />
          </motion.div>
        ) : (
          <motion.div
            key="container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <KeycapAvoidanceProvider>
              <RobotPositionProvider>
                <KeyPhysicsOverlay key={keycapEpoch} floating={direction === 'backward'} />
                <RoamingRobot ref={roamingRobotRef} />
                <main className="relative z-20 h-screen overflow-hidden">
                  <SceneCanvas />
                </main>
              </RobotPositionProvider>
            </KeycapAvoidanceProvider>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <Chatbot onRequestOpen={handleRequestOpen} onMessageSent={handleChatMessageSent} />
    </div>
  );
}

function App() {
  return (
    <SoundProvider>
      <PageNavProvider>
        <AppShell />
      </PageNavProvider>
    </SoundProvider>
  );
}

export default App;
