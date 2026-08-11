# Olive & Thyme — Restaurant Customer App

A mobile-first, in-restaurant ordering app built with React and Vite. Customers scan a QR code at their table, browse the menu, add items to their cart, and place orders — all from their device.

## Features

- **Welcome screen** — greets the customer with their table number
- **Menu browsing** — filter items by category (Starters, Mains, Pizza, Drinks, Desserts)
- **Food details** — expanded view with description, image, and quantity selector
- **Cart management** — add, update quantities, and remove items
- **Order placement** — review cart and confirm order
- **Order status tracking** — real-time status updates after order is placed
- **Smooth animations** — powered by Framer Motion throughout

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 | UI framework |
| Vite | Build tool & dev server |
| Framer Motion | Animations |
| Lucide React | Icons |

## Project Structure

```
src/
├── components/       # UI components (CartBar, FoodCard, OrderStatus, etc.)
├── context/          # CartContext for global cart state
├── data/             # Menu items and restaurant info
├── hooks/            # useCart custom hook
├── pages/            # MenuPage, OrderPage, OrderStatusPage
├── services/         # API layer
├── animations/       # Framer Motion variants
└── utils/            # formatCurrency helper
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
