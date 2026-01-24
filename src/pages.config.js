import CRMSettings from './pages/CRMSettings';
import Dashboard from './pages/Dashboard';
import EmailTemplates from './pages/EmailTemplates';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CRMSettings": CRMSettings,
    "Dashboard": Dashboard,
    "EmailTemplates": EmailTemplates,
    "Home": Home,
    "Analytics": Analytics,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};