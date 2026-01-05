import { useEffect, useState } from "react";
import "./App.css";
import { authService, articleService } from "../services";
import apiClient from "../shared/api/apiClient";
import { urlBuilder } from "../shared/constants/urlBuilder.js";
import axios from "axios";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-3xl font-bold text-red-500">VAMI Platform</p>
    </div>
  );
}

export default App;
