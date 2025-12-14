import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import RegisterPage from './Pages/RegisterPage';
import LoginPage from './Pages/LoginPage';
import DashboardPage from './Pages/DashboardPage';
import ListNewItemPage from './Pages/ListNewItemPage';
import MarketplacePage from './Pages/MarketplacePage';
import RequestBoardPage from './Pages/RequestBoardPage';
import MeetupSchedulerPage from './Pages/MeetupSchedulerPage';
import MyListingsPage from './Pages/MyListingsPage';
import OffersPage from './Pages/OffersPage';
import MessagesPage from './Pages/MessagesPage';
import OffersMessagesPage from './Pages/OffersMessagesPage';
import InviteFriendPage from './Pages/InviteFriendPage';
import ProfileCompletionPage from './Pages/ProfileCompletionPage';
import ProfilePage from './Pages/ProfilePage';
import UserProfileView from './components/UserProfileView';
import FindUsersPage from './Pages/FindUsersPage';
import FriendRequestsPage from './Pages/FriendRequestsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/list-item" element={<ListNewItemPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/request-board" element={<RequestBoardPage />} />
        <Route path="/meetup-scheduler" element={<MeetupSchedulerPage />} />
        <Route path="/my-listings" element={<MyListingsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/offers-messages" element={<OffersMessagesPage />} />
        <Route path="/invite-friend" element={<InviteFriendPage />} />
        <Route path="/profile-completion" element={<ProfileCompletionPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/find-users" element={<FindUsersPage />} />
        <Route path="/friend-requests" element={<FriendRequestsPage />} />
        <Route path="/user/:userId" element={<UserProfileView />} />
      </Routes>
    </Router>
  );
}

export default App;
