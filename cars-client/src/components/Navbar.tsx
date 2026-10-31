import { NavLink } from "react-router"

export const Navbar = () => {
    return (
        <header className="navbar">
        <div className="nav-container">
          <NavLink to="/" className="nav-brand">
            🚗 CarsApp
          </NavLink>
          <nav className="nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/cars"
              end
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Cars
            </NavLink>
            <NavLink
              to="/cars/new"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Add Car
            </NavLink>
          </nav>
        </div>
      </header>
    )
}

export default Navbar