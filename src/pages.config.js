import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CRMSettings from './pages/CRMSettings';
import EmailTemplates from './pages/EmailTemplates';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Dashboard": Dashboard,
    "CRMSettings": CRMSettings,
    "EmailTemplates": EmailTemplates,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};