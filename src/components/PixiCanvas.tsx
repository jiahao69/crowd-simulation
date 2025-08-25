import React, { useRef, useEffect } from "react";
import { PixiApp } from "../core/PixiApp";

interface PixiCanvasProps {
  onInitialized?: (app: PixiApp) => void;
}

const PixiCanvas: React.FC<PixiCanvasProps> = ({ onInitialized }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixiAppRef = useRef<PixiApp | null>(null);

  useEffect(() => {
    const initApp = async () => {
      if (!containerRef.current || pixiAppRef.current) return;

      const app = new PixiApp(containerRef.current);
      await app.initialize();
      pixiAppRef.current = app;
      onInitialized?.(app);
    };

    initApp();

    return () => {
      if (pixiAppRef.current) {
        pixiAppRef.current.destroy();
        pixiAppRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className="pixi-canvas"
      style={{ width: "100%", height: "100%" }}
      ref={containerRef}
    ></div>
  );
};

export default PixiCanvas;
