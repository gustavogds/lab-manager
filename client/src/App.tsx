import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("teste/")
      .then(response => setMessage(response.data.message))
      .catch(error => console.error("Erro ao buscar dados:", error));
  }, []);

  return <h1>{message || "Carregando..."}</h1>;
}

export default App;
