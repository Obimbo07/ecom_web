import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { DNA } from 'react-loader-spinner';
import { Navigate } from "react-router-dom";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [isloading, setIsloading] =  useState(true)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsloading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isloading) {
    return (
      <>
        <div className="h-screen flex items-center justify-center">
          <DNA
            visible={true}
            height="200"
            width="200"

            ariaLabel="dna-loading"
            wrapperStyle={{}}
            wrapperClass="dna-wrapper"
          />
        </div>
      </>
    );
  }


  return (
    <div>Home</div>
  )
}

export default Home