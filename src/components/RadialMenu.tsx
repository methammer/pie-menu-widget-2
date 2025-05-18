import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useDrag } from 'react-use-gesture';
import { Maximize2, Minimize2, Settings, Share2, Trash2, Zap, Home } from 'lucide-react'; // Removed PlusCircle

interface OrbitalItemProps {
  id: string;
  index: number;
  totalItems: number;
  angleOffset: number;
  orbitRadius: number;
  itemSize: number;
  hoveredSize: number;
  isMenuOpen: boolean;
  isHovered: boolean;
  onHoverStart: (id: string) => void;
  onHoverEnd: (id: string) => void;
  icon: React.ReactNode;
  mainButtonPosition: { x: number; y: number };
  viewportSize: { width: number; height: number };
  otherItems: Array<{ id: string; currentAngle: number; currentSize: number; isHovered: boolean }>;
  updateItemAngle: (id: string, angle: number) => void;
}

const OrbitalItem: React.FC<OrbitalItemProps> = ({
  id,
  index,
  totalItems,
  angleOffset,
  orbitRadius,
  itemSize,
  hoveredSize,
  isMenuOpen,
  isHovered,
  onHoverStart,
  onHoverEnd,
  icon,
  mainButtonPosition,
  viewportSize,
  otherItems,
  updateItemAngle,
}) => {
  const currentSize = isHovered ? hoveredSize : itemSize;
  const itemControls = useAnimation();
  const [currentAngle, setCurrentAngle] = useState((index / totalItems) * 2 * Math.PI + angleOffset);

  useEffect(() => {
    setCurrentAngle((index / totalItems) * 2 * Math.PI + angleOffset);
  }, [index, totalItems, angleOffset]);
  
  useEffect(() => {
    updateItemAngle(id, currentAngle);
  }, [currentAngle, id, updateItemAngle]);

  useEffect(() => {
    if (!isMenuOpen) {
      itemControls.start({
        x: 0,
        y: 0,
        scale: 0,
        opacity: 0,
        transition: { duration: 0.3, ease: "easeIn" },
      });
      return;
    }

    let adjustedAngle = currentAngle;
    const effectiveRadius = orbitRadius;

    // Item-to-item repulsion (simplified)
    otherItems.forEach(other => {
      if (other.id === id) return;
      const angleDiff = Math.atan2(Math.sin(adjustedAngle - other.currentAngle), Math.cos(adjustedAngle - other.currentAngle));
      const distance = Math.abs(angleDiff);
      const requiredDistance = Math.asin((currentSize / 2 + other.currentSize / 2) / effectiveRadius);
      
      if (distance < requiredDistance && distance > 0.001) {
        const repulsionForce = (requiredDistance - distance) * 0.5; // Adjust multiplier for strength
        adjustedAngle += Math.sign(angleDiff) * repulsionForce;
      }
    });
    
    // Screen edge repulsion
    let targetX = Math.cos(adjustedAngle) * effectiveRadius;
    let targetY = Math.sin(adjustedAngle) * effectiveRadius;

    const itemRight = mainButtonPosition.x + targetX + currentSize / 2;
    const itemLeft = mainButtonPosition.x + targetX - currentSize / 2;
    const itemBottom = mainButtonPosition.y + targetY + currentSize / 2;
    const itemTop = mainButtonPosition.y + targetY - currentSize / 2;

    const pushStrength = 0.1; // Radians

    if (itemRight > viewportSize.width - 10) adjustedAngle -= pushStrength * ((itemRight - (viewportSize.width - 10)) / currentSize);
    if (itemLeft < 10) adjustedAngle += pushStrength * ((10 - itemLeft) / currentSize);
    if (itemBottom > viewportSize.height - 10) adjustedAngle -= pushStrength * ((itemBottom - (viewportSize.height - 10)) / currentSize) * (targetX > 0 ? 1 : -1); // Adjust based on quadrant
    if (itemTop < 10) adjustedAngle += pushStrength * ((10 - itemTop) / currentSize) * (targetX > 0 ? 1 : -1); // Adjust based on quadrant
    
    setCurrentAngle(adjustedAngle % (2 * Math.PI)); // Keep angle within 0-2PI

    targetX = Math.cos(adjustedAngle) * effectiveRadius;
    targetY = Math.sin(adjustedAngle) * effectiveRadius;
    
    itemControls.start({
      x: targetX,
      y: targetY,
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20, delay: index * 0.05 },
    });

  }, [
    isMenuOpen, currentAngle, orbitRadius, itemControls, index, 
    mainButtonPosition, viewportSize, currentSize, otherItems, id, updateItemAngle
  ]);


  return (
    <motion.div
      animate={itemControls}
      className="absolute rounded-full flex items-center justify-center shadow-lg"
      style={{
        width: currentSize,
        height: currentSize,
        backgroundColor: isHovered ? 'rgba(var(--primary-foreground-rgb), 0.2)' : 'rgba(var(--primary-foreground-rgb), 0.1)',
        borderColor: 'rgba(var(--primary-rgb), 0.7)',
        borderWidth: '2px',
        color: 'rgb(var(--primary-rgb))',
        cursor: 'pointer',
        zIndex: 5,
      }}
      onHoverStart={() => onHoverStart(id)}
      onHoverEnd={() => onHoverEnd(id)}
      whileHover={{ scale: 1.1 }} // Visual hover scale, actual size change is handled by currentSize
    >
      {icon}
    </motion.div>
  );
};

const initialItems = [
  { id: 'home', icon: <Home size={24} />, label: 'Home' },
  { id: 'settings', icon: <Settings size={24} />, label: 'Settings' },
  { id: 'share', icon: <Share2 size={24} />, label: 'Share' },
  { id: 'zap', icon: <Zap size={24} />, label: 'Zap' },
  { id: 'trash', icon: <Trash2 size={24} />, label: 'Trash' },
];

export const RadialMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mainButtonPosition, setMainButtonPosition] = useState({ x: 100, y: 100 });
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  // Changed from useState as setAngleOffset was unused. If dynamic rotation is needed later, revert to useState.
  const angleOffset = 0; // Used to rotate the whole menu for edge avoidance 
  const [itemAngles, setItemAngles] = useState<Record<string, number>>({});

  const mainButtonRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null); // Assuming the menu is constrained to a specific div
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const mainButtonSize = 60;
  const itemBaseSize = 48;
  const itemHoveredSize = 56;
  const orbitRadius = 120;

  useEffect(() => {
    const updateViewportSize = () => {
      if (viewportRef.current) {
        setViewportSize({
          width: viewportRef.current.offsetWidth,
          height: viewportRef.current.offsetHeight,
        });
      } else {
         setViewportSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };
    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  const bindMainButtonDrag = useDrag(({ offset: [x, y], down, movement: [mx, my] }) => {
    const newX = Math.max(mainButtonSize / 2, Math.min(x, viewportSize.width - mainButtonSize / 2));
    const newY = Math.max(mainButtonSize / 2, Math.min(y, viewportSize.height - mainButtonSize / 2));
    setMainButtonPosition({ x: newX, y: newY });

    if (down && (Math.abs(mx) > 5 || Math.abs(my) > 5) && isOpen) {
       // If dragging significantly, consider closing the menu or handling differently
    }
  }, {
    initial: () => [mainButtonPosition.x, mainButtonPosition.y],
    bounds: { 
      left: mainButtonSize / 2, 
      top: mainButtonSize / 2, 
      right: viewportSize.width - mainButtonSize / 2, 
      bottom: viewportSize.height - mainButtonSize / 2 
    }
  });

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleItemHoverStart = (id: string) => setHoveredItemId(id);
  const handleItemHoverEnd = () => setHoveredItemId(null);

  const updateItemAngleCallback = useCallback((id: string, angle: number) => {
    setItemAngles(prev => ({ ...prev, [id]: angle }));
  }, []);

  const preparedItems = initialItems.map(item => ({
    ...item,
    currentAngle: itemAngles[item.id] || 0,
    currentSize: item.id === hoveredItemId ? itemHoveredSize : itemBaseSize,
    isHovered: item.id === hoveredItemId,
  }));

  return (
    <div ref={viewportRef} className="w-full h-full relative overflow-hidden">
      <motion.div
        ref={mainButtonRef}
        {...bindMainButtonDrag()}
        className="fixed rounded-full flex items-center justify-center cursor-grab shadow-xl"
        style={{
          width: mainButtonSize,
          height: mainButtonSize,
          backgroundColor: 'rgb(var(--primary-rgb))',
          color: 'rgb(var(--primary-foreground-rgb))',
          touchAction: 'none',
          zIndex: 10,
        }}
        animate={{ x: mainButtonPosition.x - mainButtonSize/2 , y: mainButtonPosition.y - mainButtonSize/2 }}
        whileTap={{ cursor: 'grabbing', scale: 0.95 }}
        onClick={toggleMenu}
      >
        {isOpen ? <Minimize2 size={28} /> : <Maximize2 size={28} />}
      </motion.div>

      <div 
        style={{ 
          position: 'fixed', 
          left: mainButtonPosition.x, 
          top: mainButtonPosition.y,
          transform: 'translate(-50%, -50%)', // Center items around this point
          zIndex: 1 
        }}
      >
        <AnimatePresence>
          {initialItems.map((item, index) => (
            <OrbitalItem
              key={item.id}
              id={item.id}
              index={index}
              totalItems={initialItems.length}
              angleOffset={angleOffset}
              orbitRadius={orbitRadius}
              itemSize={itemBaseSize}
              hoveredSize={itemHoveredSize}
              isMenuOpen={isOpen}
              isHovered={item.id === hoveredItemId}
              onHoverStart={handleItemHoverStart}
              onHoverEnd={handleItemHoverEnd}
              icon={item.icon}
              mainButtonPosition={mainButtonPosition}
              viewportSize={viewportSize}
              otherItems={preparedItems.filter(i => i.id !== item.id)}
              updateItemAngle={updateItemAngleCallback}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
