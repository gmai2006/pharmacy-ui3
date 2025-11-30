import React, { useEffect, useRef, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

import {
  LayoutDashboard, Users, Package, BarChart3, Settings,
  Bell, Search, Menu, X, ChevronRight,
  TriangleAlert,
  DollarSign,
  Computer
} from 'lucide-react';

// import PharmacyWorkflow from '../prescription/PharmacyFlow';
// import PharmacyFinancialReports from '../report/PharmacyFinancialReports';

// import PatientPage from '../patient/PatientPage';
// import AlertPage from '../alert/AlertPage';
// import PharmacistPage from '../PharmacistPage';

// import AuthLogViewer from '../report/AuthLogViewer';
// import AdminAuthDashboard from '../report/AdminAuthDashboard';
// import DirMarginDashboard from '../report/DIRMarginDashboard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useUser } from "../../context/UserContext";

import '../../index.css';
import '../../App.css';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
// import InventoryWorkflow from '../inventory/InventoryFlow';
// import ClaimFlow from '../claim/ClaimFlow';
// import ContactLogTestPage from '../prescription/TestPrescriptionLog';

import OktaLoginModal from '../../components/OktaLogin';
import SilentLogin from '../../components/SilientLogin';

import DeviceFingerprintPage from '../devices/DeviceFingerprintPage';
import PrescriberManagement from '../prescribers/PrescriberPage';
import PatientWithInsurancePage from '../patients/PatientWithInsurancePage';
import InsurancePlanManagement from '../insurances/InsurancePlanManagement';
import WorkflowDashboard from '../prescriptions/WorkflowDashboard';
import UserPage from '../users/UserPage';
import StationPage from '../stations/StationPage';
import PrescriberPage from '../prescribers/PrescriberPage';
import AuthLogPage from '../authlogs/AuthLogPage';
import InsuranceCompanyWithPlansPage from '../insurances/InsuranceCompanyWithPlansPage';
import PatientInsurancePage from '../patients/PatientInsurancePage';
import WorkflowPanel from '../workflow/WorkflowPanel';

export default function Dashboard() {
  const { user, appUser, isAuthenticated, isLoading, stationName, login, logout } = useUser();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage] = useState('');
  const wsRef = useRef(null);

  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'workflow', path: '/workflow', icon: TriangleAlert, label: 'Workflow' },
    { id: 'prescriber', path: '/prescriber', icon: TriangleAlert, label: 'Prescriber' },
    { id: 'insurances', path: '/insurances', icon: TriangleAlert, label: 'Insurances' },
    { id: 'patients', path: '/patients', icon: TriangleAlert, label: 'Patients' },
    { id: 'authlogs', path: '/authlogs', icon: TriangleAlert, label: 'AuthLogs' },
    // { id: 'inventory', path: '/inventory', icon: Users, label: 'Inventory' },
    // { id: 'claims', path: '/claims', icon: Users, label: 'Claims' },
    // { id: 'users', path: '/users', icon: Users, label: 'Users' },
    // { id: 'patients', path: '/patients', icon: Users, label: 'Patients' },
    // { id: 'pharmacist', path: '/pharmacist', icon: Package, label: 'Pharmacists' },
    // { id: 'alert', path: '/alert', icon: TriangleAlert, label: 'Alert' },
    // { id: 'analytics', path: '/analytics', icon: BarChart3, label: 'Analytics' },
    // { id: 'logs', path: '/logs', icon: TriangleAlert, label: 'Auth Logs' },
    // { id: 'systemlogs', path: '/systemlogs', icon: TriangleAlert, label: 'Auth Dashboard' },
    // { id: 'settings', path: '/settings', icon: Settings, label: 'Settings' },
    // { id: 'prescriptonlog', path: '/testprescrptionlog', icon: Settings, label: 'testprescrptionlog' },
    { id: 'users', path: '/users', icon: Computer, label: 'Users' },
    { id: 'stations', path: '/stations', icon: Computer, label: 'Stations' },
    { id: 'devices', path: '/devices', icon: Computer, label: 'devices' },
];


  if (!appUser) {
    return <LoadingSpinner />
  }


  return (
    <div className="flex h-screen bg-gray-50">
    
      <DashboardSidebar menuItems={menuItems} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Bar */}
        <DashboardHeader  stationName={stationName}/>

        {/* Routes */}
        <div className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<UserPage />} />
            {/* <Route path="/" element={<WorkflowDashboard />} /> */}
          <Route path="/prescriber" element={<PrescriberPage />} />
            <Route path="/insurances" element={<InsuranceCompanyWithPlansPage />} />
            <Route path="/patients" element={<PatientInsurancePage />} />
            <Route path="/workflow" element={<WorkflowPanel />} />

            {/* <Route path="/inventory" element={<InventoryWorkflow />} />
            <Route path="/claims" element={<ClaimFlow />} />
            <Route path="/users" element={<UserPage />} />
            <Route path="/patients" element={<PatientPage />} />
            <Route path="/pharmacist" element={<PharmacistPage />} />
            <Route path="/alert" element={<AlertPage />} />
            <Route path="/analytics" element={<PharmacyFinancialReports icon={BarChart3} />} />
            <Route path="/logs" element={<AuthLogViewer />} />
            <Route path="/systemlogs" element={<AdminAuthDashboard />} />
            <Route path="/settings" element={<DirMarginDashboard />} />
            <Route path="/testprescrptionlog" element={<ContactLogTestPage />} /> */}
            <Route path="/authlogs" element={<AuthLogPage />} />
            <Route path="/users" element={<UserPage />} />
            <Route path="/stations" element={<StationPage />} />
            <Route path="/devices" element={<DeviceFingerprintPage />} />
          </Routes>
        </div>

      </div>
    </div>
  );
}
