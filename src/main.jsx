import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Login from './views/Login'
import Dashboard from './views/Dashboard'
import './index.css'
import Registro from './views/Registro'
import Playlist from './views/Playlists'
import Player from './views/Player';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/player/:playlistId" element={<Player />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/playlists" element={<Playlist />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)