import { Bell, Menu } from "lucide-react";

export default function MenuHeader({ restaurantName, tableNumber }) {
  return (
    <header className="menu-header">
      <button className="icon-button">
        <Menu size={21} />
      </button>

      <div className="restaurant-title">
        <h2>{restaurantName}</h2>

        <span>TABLE {tableNumber}</span>
      </div>

      <button className="icon-button">
        <Bell size={20} />
      </button>
    </header>
  );
}