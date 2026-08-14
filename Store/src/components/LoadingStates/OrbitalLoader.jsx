import './OrbitalLoader.css';

const ORBIT_RADII = [50, 75, 100];

export default function OrbitalLoader({ text = 'Loading...' }) {
  return (
    <div className="orbital-loader">
      <svg viewBox="0 0 200 200" width="200" height="200">
        {ORBIT_RADII.map((radius) => (
          <circle key={`orbit-${radius}`} cx="100" cy="100" r={radius} className="orbit" />
        ))}

        {ORBIT_RADII.map((radius) => (
          <g key={`crosshair-${radius}`}>
            <line x1="100" y1={100 - radius} x2="100" y2={100 - radius - 5} className="crosshair" />
            <line x1="100" y1={100 + radius} x2="100" y2={100 + radius + 5} className="crosshair" />
            <line x1={100 - radius} y1="100" x2={100 - radius - 5} y2="100" className="crosshair" />
            <line x1={100 + radius} y1="100" x2={100 + radius + 5} y2="100" className="crosshair" />
          </g>
        ))}

        <g className="nucleus-group">
          <circle cx="100" cy="100" r="8" className="nucleus" />
          <circle cx="100" cy="95" r="1.5" className="nucleus-marker" />
          <circle cx="105" cy="100" r="1.5" className="nucleus-marker" />
          <circle cx="100" cy="105" r="1.5" className="nucleus-marker" />
          <circle cx="95" cy="100" r="1.5" className="nucleus-marker" />
        </g>
      </svg>
      <p className="loader-text">{text}</p>
    </div>
  );
}
