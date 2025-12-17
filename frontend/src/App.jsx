
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Register from "./Register";
import ProtectedRoute from "./ProtectedRoute";
import Logout from "./Logout"; // ← Ab kaam karega
import MyCompany from "./components/CompanyForm/CompanyForm";
import AddCompanyButton from "./components/AddCompanyButton/AddCompanyButton";
import PlansModal from "./components/PlansModal/PlansModal";
import Settings from "./components/AccountSettings/AccountSettings";
import PlanDetails from "./components/PlanDetails/PlanDetails";
import Tenders from "./components/Tenders/Tenders";

import EditCompany from "./components/EditCompany/EditCompany";
import ParticipationForm from "./components/ParticipationForm/ParticipationForm";
import Report from "./components/Report/Report";
import DocumentPrepared from "./components/DocumentPrepared/DocumentPrepared";
import DocumentData from '././components/DocumentData/DocumentData'
import AIAgent from "./components/AIAgent.jsx/AIAgent";
import DocumentPreview from "./DocumentPreview/DocumentPreview";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/addcompany" element={<AddCompanyButton />} />
       



        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/logout" element={<Logout />} />
        <Route path="/CompanyForm" element={<MyCompany />} />
        <Route path="/PlansModal" element={<PlansModal />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/OngoingTender" element={<Tenders />} />
        <Route path="/plandetails" element={<PlanDetails />} />
        <Route path="/tedoAI" element={<AIAgent />} />
        <Route path="/editcompany/:id" element={<EditCompany />} />
        <Route path="/participation-form" element={<ParticipationForm />} />
        <Route path="/report" element={<Report />} />
        <Route path="/documentprepared" element={<DocumentPrepared />} />
        <Route path="/documentdata" element={<DocumentData />} />
        <Route path="/preview-document" element={<DocumentPreview />} />
      </Routes>
    </Router>
  );
}

export default App;