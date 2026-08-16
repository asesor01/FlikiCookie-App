import React from "react";
import { CustomCakeSpec } from "../types";

interface CakeVisualizerProps {
  spec: CustomCakeSpec;
}

export default function CakeVisualizer({ spec }: CakeVisualizerProps) {
  const { tiers, flavor, filling, frostingColor, frostingName, toppings, inscription } = spec;

  // Render tiers
  const renderTier = (tierIndex: number) => {
    // Width and height changes based on tier index (bottom, middle, top)
    let width = 300;
    let height = 75;
    let y = 260; // bottom
    let scaleX = 1;

    if (tierIndex === 2) {
      // Middle tier (only rendered if tiers >= 2)
      width = 220;
      height = 70;
      y = 180;
    } else if (tierIndex === 3) {
      // Top tier (only rendered if tiers === 3)
      width = 150;
      height = 65;
      y = 110;
    }

    const rx = width / 2;
    const ry = 18; // 3D ellipse height perspective

    // Find frosting color and cream filling color based on selection
    const frosting = frostingColor || "#FDFDFD";
    
    // Slight darker version of frosting for shadow
    const shadowColor = adjustColorBrightness(frosting, -15);
    const highlightColor = adjustColorBrightness(frosting, 10);

    return (
      <g key={`tier-${tierIndex}`} className="transition-all duration-500 ease-out">
        {/* Tier Shadow base */}
        <ellipse
          cx="200"
          cy={y + height}
          rx={rx}
          ry={ry}
          fill="rgba(0, 0, 0, 0.1)"
        />

        {/* Cake main 3D cylinder body */}
        {/* We draw the bottom curved segment */}
        <path
          d={`M ${200 - rx} ${y} 
              v ${height} 
              A ${rx} ${ry} 0 0 0 ${200 + rx} ${y + height} 
              v -${height} 
              A ${rx} ${ry} 0 0 1 ${200 - rx} ${y}`}
          fill={frosting}
          stroke={shadowColor}
          strokeWidth="1.5"
        />

        {/* 3D shadow side of the cylinder (left-to-right gradient style) */}
        <path
          d={`M ${200 - rx} ${y} 
              v ${height} 
              A ${rx} ${ry} 0 0 0 ${200 + rx} ${y + height} 
              v -${height} 
              A ${rx} ${ry} 0 0 1 ${200 - rx} ${y}`}
          fill={`url(#shadow-grad-${tierIndex})`}
          opacity="0.25"
        />

        {/* Cream filling line (visual sandwich effect in the middle of the tier) */}
        <path
          d={`M ${200 - rx} ${y + height / 2} 
              A ${rx} ${ry} 0 0 0 ${200 + rx} ${y + height / 2}`}
          fill="none"
          stroke={getFillingColor(filling)}
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.9"
          className="animate-pulse"
        />

        {/* Frosting Drips (custom dripping effect on the tier rim) */}
        <path
          d={`M ${200 - rx} ${y}
              c ${rx * 0.2} 10, ${rx * 0.1} 8, ${rx * 0.3} 2
              c ${rx * 0.15} -3, ${rx * 0.2} 14, ${rx * 0.35} 5
              c ${rx * 0.1} -4, ${rx * 0.2} 12, ${rx * 0.35} 0
              A ${rx} ${ry} 0 0 1 ${200 - rx} ${y}`}
          fill={shadowColor}
          opacity="0.4"
        />

        {/* Top flat lid (ellipse) of the cylinder */}
        <ellipse
          cx="200"
          cy={y}
          rx={rx}
          ry={ry}
          fill={frosting}
          stroke={highlightColor}
          strokeWidth="1"
        />

        {/* Inner glow or shine on top of the tier */}
        <ellipse
          cx="200"
          cy={y}
          rx={rx - 4}
          ry={ry - 2}
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1.5"
        />

        {/* Gradients definitions */}
        <defs>
          <linearGradient id={`shadow-grad-${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.4" />
            <stop offset="30%" stopColor="#000" stopOpacity="0.1" />
            <stop offset="70%" stopColor="#FFF" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </g>
    );
  };

  // Helper to retrieve filling color hex
  const getFillingColor = (fillingName: string) => {
    switch (fillingName) {
      case "Dulce de Leche": return "var(--color-art-border)";
      case "Mermelada de Fresa": return "var(--color-art-accent)";
      case "Crema de Queso": return "var(--color-art-panel)";
      case "Nutella": return "var(--color-art-muted)";
      case "Ganache de Chocolate": return "var(--color-art-muted)";
      default: return "var(--color-art-bg)";
    }
  };

  // Helper to adjust color hex brightness for realistic 3D shadows and highlights
  function adjustColorBrightness(hex: string, percent: number) {
    if (!hex || hex.startsWith("url")) return hex;
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = parseInt(((R * (100 + percent)) / 100).toString());
    G = parseInt(((G * (100 + percent)) / 100).toString());
    B = parseInt(((B * (100 + percent)) / 100).toString());

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    R = R > 0 ? R : 0;
    G = G > 0 ? G : 0;
    B = B > 0 ? B : 0;

    const rHex = R.toString(16).padStart(2, "0");
    const gHex = G.toString(16).padStart(2, "0");
    const bHex = B.toString(16).padStart(2, "0");

    return `#${rHex}${gHex}${bHex}`;
  }

  // Draw toppings scattered on tiers
  const renderToppingsOnTier = (tierIndex: number) => {
    let y = 260; // bottom
    let rx = 150;
    let count = 8;

    if (tierIndex === 2) {
      y = 180;
      rx = 110;
      count = 6;
    } else if (tierIndex === 3) {
      y = 110;
      rx = 75;
      count = 5;
    }

    // Positions around the ellipse edge
    const positions = Array.from({ length: count }).map((_, i) => {
      const angle = (i * (2 * Math.PI)) / count + (tierIndex * 0.5); // Stagger rotation
      const px = 200 + rx * 0.85 * Math.cos(angle);
      const py = y + 10 * Math.sin(angle); // match perspectives
      return { x: px, y: py };
    });

    return toppings.map((topping, topIdx) => {
      let icon = "✨";
      let color = "#FFD700";

      if (topping === "Chispas de colores") {
        return (
          <g key={`toppings-${tierIndex}-${topIdx}`}>
            {positions.map((p, pIdx) => {
              const sprinkleColors = ["#FF69B4", "#40E0D0", "#FFD700", "#7CFC00", "#FF8C00", "#8A2BE2"];
              const randomColor = sprinkleColors[(pIdx + topIdx) % sprinkleColors.length];
              return (
                <g key={`sprinkle-${pIdx}`} transform={`translate(${p.x}, ${p.y})`}>
                  <rect x="-1" y="-4" width="2" height="6" rx="1" fill={randomColor} transform={`rotate(${pIdx * 45})`} />
                </g>
              );
            })}
          </g>
        );
      }

      if (topping === "Fresas frescas") {
        icon = "🍓";
      } else if (topping === "Macarons") {
        icon = "🧁";
      } else if (topping === "Flores de azúcar") {
        icon = "🌸";
      } else if (topping === "Virutas de chocolate") {
        return (
          <g key={`toppings-${tierIndex}-${topIdx}`}>
            {positions.map((p, pIdx) => (
              <g key={`shaving-${pIdx}`} transform={`translate(${p.x}, ${p.y})`}>
                <path d="M-3,-2 Q0,2 3,-1" fill="none" stroke="var(--color-art-muted)" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${pIdx * 72})`} />
              </g>
            ))}
          </g>
        );
      }

      return (
        <g key={`toppings-${tierIndex}-${topIdx}`} className="animate-fade-in">
          {positions.map((p, pIdx) => (
            <text
              key={`topping-icon-${pIdx}`}
              x={p.x}
              y={p.y + 4}
              fontSize="14"
              textAnchor="middle"
              className="cursor-default select-none hover:scale-130 transition-transform duration-200"
            >
              {icon}
            </text>
          ))}
        </g>
      );
    });
  };

  return (
    <div id="cake_visualizer_container" className="flex flex-col items-center justify-center bg-art-panel rounded-lg p-6 border border-art-border shadow-inner w-full min-h-[360px]">
      <svg
        viewBox="0 0 400 400"
        className="w-full max-w-[340px] h-auto drop-shadow-xl overflow-visible"
        id="cake_svg"
      >
        {/* Elegant Glass Cake Stand / Platillo */}
        <g id="cake_stand" className="transition-all duration-300">
          {/* Base Stand foot */}
          <path
            d="M 170 340 L 160 380 L 240 380 L 230 340 Z"
            fill="var(--color-art-panel)"
            stroke="var(--color-art-border)"
            strokeWidth="1.5"
            opacity="0.95"
          />
          <ellipse cx="200" cy="380" rx="40" ry="8" fill="var(--color-art-border)" opacity="0.4" />
          
          {/* Main Round Stand Plate */}
          <ellipse
            cx="200"
            cy="340"
            rx="170"
            ry="25"
            fill="rgba(253, 248, 243, 0.95)"
            stroke="var(--color-art-border)"
            strokeWidth="2"
          />
          {/* Glass plate shiny rim */}
          <ellipse
            cx="200"
            cy="338"
            rx="165"
            ry="21"
            fill="none"
            stroke="rgba(255, 255, 255, 0.75)"
            strokeWidth="2"
          />
          {/* Stand Shadow */}
          <ellipse
            cx="200"
            cy="342"
            rx="155"
            ry="18"
            fill="none"
            stroke="rgba(229,168,75,0.12)"
            strokeWidth="4"
          />
        </g>

        {/* TIER 1 (Always rendered - Bottom) */}
        {renderTier(1)}
        {renderToppingsOnTier(1)}

        {/* TIER 2 (Rendered if 2 or 3 tiers) */}
        {tiers >= 2 && (
          <g className="transition-all duration-500 ease-out">
            {renderTier(2)}
            {renderToppingsOnTier(2)}
          </g>
        )}

        {/* TIER 3 (Rendered only if 3 tiers) */}
        {tiers === 3 && (
          <g className="transition-all duration-500 ease-out">
            {renderTier(3)}
            {renderToppingsOnTier(3)}
          </g>
        )}

        {/* Cake Inscription / Dedicatoria text rendering */}
        {inscription && (
          <g id="cake_inscription" className="animate-fade-in-up transition-all duration-300">
            {/* We place the text beautifully on the top-most tier */}
            <path
              id="text-path-top"
              d={
                tiers === 3
                  ? "M 135 110 Q 200 120 265 110"
                  : tiers === 2
                  ? "M 110 180 Q 200 195 290 180"
                  : "M 70 260 Q 200 280 330 260"
              }
              fill="none"
              stroke="none"
            />
            <text fill="var(--color-art-muted)" stroke="#FFF" strokeWidth="0.5" className="font-serif italic font-bold select-none text-shadow-sm pointer-events-none" fontSize={tiers === 3 ? "9" : tiers === 2 ? "12" : "14"} letterSpacing="0.5">
              <textPath href="#text-path-top" startOffset="50%" textAnchor="middle">
                {inscription}
              </textPath>
            </text>
          </g>
        )}

        {/* Lit candles if selected? Let's add an ambient candle on top as details for extreme polish! */}
        <g id="candles" className="hover:scale-105 transition-transform duration-300">
          <rect
            x="197"
            y={tiers === 3 ? "30" : tiers === 2 ? "95" : "175"}
            width="6"
            height="25"
            rx="1"
            fill="url(#candle-grad)"
          />
          {/* Flame */}
          <path
            d={`M 200 ${tiers === 3 ? "15" : tiers === 2 ? "80" : "160"} 
                Q 196 ${tiers === 3 ? "24" : tiers === 2 ? "89" : "169"} 200 ${tiers === 3 ? "30" : tiers === 2 ? "95" : "175"}
                Q 204 ${tiers === 3 ? "24" : tiers === 2 ? "89" : "169"} 200 ${tiers === 3 ? "15" : tiers === 2 ? "80" : "160"}`}
            fill="var(--color-art-border)"
            className="animate-pulse"
          />
            <path
            d={`M 200 ${tiers === 3 ? "18" : tiers === 2 ? "83" : "163"} 
                Q 198 ${tiers === 3 ? "24" : tiers === 2 ? "89" : "169"} 200 ${tiers === 3 ? "28" : tiers === 2 ? "93" : "173"}
                Q 202 ${tiers === 3 ? "24" : tiers === 2 ? "89" : "169"} 200 ${tiers === 3 ? "18" : tiers === 2 ? "83" : "163"}`}
            fill="var(--color-art-muted)"
            className="animate-pulse"
          />
          
          <defs>
            <linearGradient id="candle-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-art-border)" />
              <stop offset="50%" stopColor="var(--color-art-panel)" />
              <stop offset="100%" stopColor="var(--color-art-muted)" />
            </linearGradient>
          </defs>
        </g>
      </svg>

      {/* Decorative Blueprint spec details under the visualizer */}
      <div className="mt-4 text-center bg-white rounded-lg px-4 py-2 border border-art-border shadow-sm w-full">
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-art-muted font-medium">
          <span className="font-serif">🍰 {tiers} Piso(s)</span>
          <span>•</span>
          <span>🍞 Masa: {flavor}</span>
          <span>•</span>
          <span>🍯 Relleno: {filling}</span>
        </div>
        <div className="mt-1 text-art-text text-xs font-serif font-bold">
          Cobertura: <span className="underline decoration-dotted" style={{ textDecorationColor: frostingColor }}>{frostingName}</span>
        </div>
      </div>
    </div>
  );
}
