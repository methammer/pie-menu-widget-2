import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';

export const RadialMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Relative to center for now

  const toggleMenu = () => setIsOpen(!isOpen);

  // Placeholder items
  const items = [
    { id: '1', icon: 'A' },
    { id: '2', icon: 'B' },
    { id: '3', icon: 'C' },
  ];
  const numItems = items.length;
  const angleStep = (2 * Math.PI) / numItems;
  const radius = 100;

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Main Button */}
      <motion.button
        onClick={toggleMenu}
        className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'absolute',
          // Centering the button for now, drag will be added later
          left: `calc(50% - 2rem + ${position.x}px)`,
          top: `calc(50% - 2rem + ${position.y}px)`,
        }}
      >
        {isOpen ? <Minimize2 size={28} /> : <Maximize2 size={28} />}
      </motion.button>

      {/* Orbital Items */}
      {isOpen &&
        items.map((item, index) => {
          const angle = angleStep * index;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          return (
            <motion.div
              key={item.id}
              className="absolute w-12 h-12 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center shadow-md"
              style={{
                // Position relative to the container's center
                left: `calc(50% - 1.5rem)`,
                top: `calc(50% - 1.5rem)`,
                // transform will place them in orbit
              }}
              initial={{ x: position.x, y: position.y, opacity: 0, scale: 0.5 }}
              animate={{ x: position.x + x, y: position.y + y, opacity: 1, scale: 1 }}
              exit={{ x: position.x, y: position.y, opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.05 }}
            >
              {item.icon}
            </motion.div>
          );
        })}
    </div>
  );
};
