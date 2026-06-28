import { NavLink, useLocation } from "react-router-dom";
import { getAS6LivingSpaceMenuItems } from "./as6LivingSpaceEngine";
import "./AS6LivingSpaceNav.css";

export function AS6LivingSpaceNav() {
  const location = useLocation();
  const menuItems = getAS6LivingSpaceMenuItems();

  if (!menuItems.length) {
    return null;
  }

  return (
    <nav className="as6-living-space-nav" aria-label="AS6 Living Spaces">
      <div className="as6-living-space-nav__label">Living Spaces</div>
      <div className="as6-living-space-nav__items">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.route;

          return (
            <NavLink
              key={item.id}
              to={item.route}
              className={({ isActive: navIsActive }) =>
                navIsActive || isActive
                  ? "as6-living-space-nav__item as6-living-space-nav__item--active"
                  : "as6-living-space-nav__item"
              }
            >
              <span className="as6-living-space-nav__text">{item.label}</span>
              {item.authRequired ? (
                <span className="as6-living-space-nav__badge">auth</span>
              ) : null}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
