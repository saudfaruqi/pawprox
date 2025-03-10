


// Logout.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setFadeOut(true);
    const timer = setTimeout(() => {
      console.log("Clearing localStorage");
      localStorage.clear();
      console.log("After clear:", localStorage);
      navigate("/");
    }, 1000);    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`min-h-screen flex items-center justify-center transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;
