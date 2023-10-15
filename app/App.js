import { createAppContainer } from 'react-navigation';
import { createStackNavigator} from 'react-navigation-stack';
import HomePage from './components/HomePage';
import Chat from './components/Chat';
import { initializeApp } from "firebase/app";
import { LogBox } from 'react-native';
 
LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();
LogBox.ignoreLogs(['Warning: ...'], (isAffected, bundle) => {
  return isAffected || bundle.includes('example.js');
});

const firebaseConfig = {
  apiKey: "AIzaSyBCEvDb40LYj1-1X8Ln3PS-wPU0TlsDmA0",
  authDomain: "voice-enabled-chat-bot.firebaseapp.com",
  projectId: "voice-enabled-chat-bot",
  storageBucket: "voice-enabled-chat-bot.appspot.com",
  messagingSenderId: "43636082724",
  appId: "1:43636082724:web:33bbe6b5201cd13a4af0b1",
  measurementId: "G-BEKC8JDRMK"
};

initializeApp(firebaseConfig);

const App = createStackNavigator({
    HomePage                    : { screen: HomePage },
    Chat                        : { screen: Chat },
  },
  {
    initialRouteName: 'HomePage'
  }
);
export default createAppContainer(App);