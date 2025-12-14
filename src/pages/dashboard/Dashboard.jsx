import React, { useEffect, useRef, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

import {
  LayoutDashboard, 
  TriangleAlert,
  Computer,
  ShieldAlert,
  User,
  Lock,
  Phone
} from 'lucide-react';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useUser } from "../../context/UserContext";

import '../../index.css';
import '../../App.css';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

import DeviceFingerprintPage from '../devices/DeviceFingerprintPage';
import UserPage from '../users/UserPage';
import StationPage from '../stations/StationPage';
import PrescriberPage from '../prescribers/PrescriberPage';
import AuthLogPage from '../authlogs/AuthLogPage';
import InsuranceCompanyWithPlansPage from '../insurances/InsuranceCompanyWithPlansPage';
import PatientInsurancePage from '../patients/PatientInsurancePage';

import PrescriptionListPage from '../prescriptions/PrescriptionListPage';
import PrescriptionDetailPage from '../prescriptions/PrescriptionDetailPage';
import WorkflowQueuePage from '../prescriptions/WorkflowQueuePage';
import FillQueuePage from '../prescriptions/FillQueuePage';
import PrescriptionDashboard from '../prescriptions2/PrescriptionDashboard';
import RolePage from '../roles/RolePage';
import ClaimsDashboard from '../claims/ClaimsDashboard.jsx';
import FaxJobPage from '../fax/FaxJobPage.jsx';


export default function Dashboard() {
  const { user, appUser, isAuthenticated, isLoading, stationName, login, logout } = useUser();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage] = useState('');
  const wsRef = useRef(null);

  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    // { id: 'workflow', path: '/workflow', icon: TriangleAlert, label: 'Workflow' },
    // { id: 'queue', path: '/queue', icon: TriangleAlert, label: 'Workflow Queue' },
    // { id: 'fill', path: '/fill', icon: TriangleAlert, label: 'Workflow Fill Queue' },
  
    { id: 'prescriber', path: '/prescriber', icon: TriangleAlert, label: 'Prescriber' },
    { id: 'insurances', path: '/insurances', icon: TriangleAlert, label: 'Insurances' },
    { id: 'patients', path: '/patients', icon: TriangleAlert, label: 'Patients' },
    { id: 'authlogs', path: '/authlogs', icon: TriangleAlert, label: 'AuthLogs' },
    // { id: 'inventory', path: '/inventory', icon: Users, label: 'Inventory' },
    { id: 'claims', path: '/claims', icon: ShieldAlert, label: 'Claims' },
    // { id: 'users', path: '/users', icon: Users, label: 'Users' },
    // { id: 'patients', path: '/patients', icon: Users, label: 'Patients' },
    // { id: 'pharmacist', path: '/pharmacist', icon: Package, label: 'Pharmacists' },
    // { id: 'alert', path: '/alert', icon: TriangleAlert, label: 'Alert' },
    // { id: 'analytics', path: '/analytics', icon: BarChart3, label: 'Analytics' },
    // { id: 'logs', path: '/logs', icon: TriangleAlert, label: 'Auth Logs' },
    // { id: 'systemlogs', path: '/systemlogs', icon: TriangleAlert, label: 'Auth Dashboard' },
    // { id: 'settings', path: '/settings', icon: Settings, label: 'Settings' },
    // { id: 'prescriptonlog', path: '/testprescrptionlog', icon: Settings, label: 'testprescrptionlog' },
    { id: 'roles', path: '/roles', icon: Lock, label: 'Roles' },
    { id: 'users', path: '/users', icon: User, label: 'Users' },
    { id: 'faxes', path: '/faxes', icon: Phone, label: 'Faxes' },
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
            <Route path="/" element={<PrescriptionDashboard />} />
            {/* <Route path="/" element={<WorkflowDashboard />} /> */}
          <Route path="/prescriber" element={<PrescriberPage />} />
            <Route path="/insurances" element={<InsuranceCompanyWithPlansPage />} />
            <Route path="/patients" element={<PatientInsurancePage />} />
            
            <Route path="/prescriptions/:id" element={<PrescriptionDetailPage />} />
            
            {/* <Route path="/inventory" element={<InventoryWorkflow />} /> */}
            <Route path="/claims" element={<ClaimsDashboard />} />

            {/* <Route path="/pharmacist" element={<PharmacistPage />} />
            <Route path="/alert" element={<AlertPage />} />
            <Route path="/analytics" element={<PharmacyFinancialReports icon={BarChart3} />} />
            <Route path="/logs" element={<AuthLogViewer />} />
            <Route path="/systemlogs" element={<AdminAuthDashboard />} />
            <Route path="/settings" element={<DirMarginDashboard />} />
            <Route path="/testprescrptionlog" element={<ContactLogTestPage />} /> */}
            <Route path="/roles" element={<RolePage />} />
            <Route path="/authlogs" element={<AuthLogPage />} />
            <Route path="/users" element={<UserPage />} />
            <Route path="/faxes" element={<FaxJobPage />} />
            <Route path="/stations" element={<StationPage />} />
            <Route path="/devices" element={<DeviceFingerprintPage />} />
          </Routes>
        </div>

      </div>
    </div>
  );
}
