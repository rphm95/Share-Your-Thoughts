// import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom';

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import NotificationPage from './pages/notifications/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';

import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import { Toaster } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  // const [count, setCount] = useState(0)
  const { data:authUser, isLoading } = useQuery({
    queryKey: ['authUser'], // we are using this key so later we can access it in the queryClient anywhere in the app
    queryFn: async () => {
      try {
        // Fetch the user data from the server
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if(data.error) return null; // if there is an error, return null, because when we log out the server is returning a empty object and not refetching the new page, so we need to make sure that the server is invalidating the cache
        if (!res.ok) throw new Error(data.error || 'Failed to load user');
        console.log("authUser is here: ", data);
        return data;

      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false, // we don't want to retry the request if it fails
  })
  
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  //console.log("authUser: ", authUser);

  return (
    <div className="flex max-w-6xl mx-auto">
     {authUser && <Sidebar /> } {/* // this is like this so we can use the sidebar in the home page and not in the login page, so we check if the user is authenticated or not.  */}
      {/* This a common component because it not used inside the routes */}
      <Routes>
        {/* handling some situations if the user is authenticaded or not with a ternary condition */}
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login"/>} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to="/login"/>} />
        <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to="/login"/>} />
			</Routes>
      {authUser && <RightPanel /> }{/* // this is like this so we can use the sidebar in the home page and not in the login page, so we check if the user is authenticated or not.  */}
      {/* this is another common component, because is shared on all pages */}
      <Toaster />
    </div>
  )
}

export default App
