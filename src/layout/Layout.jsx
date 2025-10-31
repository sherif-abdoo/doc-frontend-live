import {useLocation} from "react-router-dom";
import NavBar from "./NavBar";


const Layout = ({ children }) => {
    const location = useLocation();
    const path = location.pathname;

    const hideNav = path === '/login' || path === '/signup' ;
    return (
        <>
            {!hideNav && <NavBar/>}
            {children}
        </>
    )
}

export default Layout;