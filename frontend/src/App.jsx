// import './App.css'
import { Route, Routes } from 'react-router-dom';

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import NotificationPage from './pages/notifications/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';

import Sidebar from './components/common/SideBar';
import RightPanel from './components/common/RightPanel';

function App() {
  // const [count, setCount] = useState(0)

  return (
    <div className="flex max-w-6xl mx-auto">
      <Sidebar />
      {/* This a common component because it not used inside the routes */}
      <Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/signup' element={<SignUpPage />} />
				<Route path='/login' element={<LoginPage />} />
        <Route path='/notifications' element={<NotificationPage />} />
        <Route path='/profile/:username' element={<ProfilePage />} />
			</Routes>
      <RightPanel />
      {/* this is another common component, because is shared on all pages */}
    </div>
  )
}

export default App
