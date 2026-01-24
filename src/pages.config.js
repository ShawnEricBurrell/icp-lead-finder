import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CRMSettings from './pages/CRMSettings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Dashboard": Dashboard,
    "CRMSettings": CRMSettings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};