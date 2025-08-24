import { Link } from "react-router-dom";

export function Logo({ size = "large", variant = "default" }: { size?: "large" | "small", variant?: "default" | "black" }) {
  const getLogoSrc = () => {
    if (variant === "black") {
      return "/LOGO_BLACK.png";
    }
    return size === "large" ? "/LOGO.png" : "/LOGO_SMALL.png";
  };

  return (
    <Link to="/" className="mb-8 inline-block">
      <img
        src={getLogoSrc()}
        alt="Docs+AI"
        className={size === "large" ? "h-12 w-auto" : "h-8 w-auto"}
      />
    </Link>
  )
}
