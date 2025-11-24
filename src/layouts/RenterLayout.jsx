import { Outlet, Link } from "react-router-dom";

export default function RenterLayout() {
    return (
        <div>
            <nav>
                <Link to="/">Home</Link> | <Link to="/rooms">Rooms</Link>
            </nav>
            <div style={{ padding: 20 }}>
                <Outlet />
            </div>
        </div>
    );
}
