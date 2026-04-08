import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { servicioAuth } from '../services/servicioApi';

const ContextoAutenticacion = createContext(null);

export function ProveedorAutenticacion({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('token_salon');
      const usuarioGuardado = localStorage.getItem('usuario_salon');

      if (token && usuarioGuardado) {
        try {
          const respuesta = await servicioAuth.verificarToken();
          if (respuesta.data.exito) {
            setUsuario(respuesta.data.usuario);
          } else {
            limpiarSesion();
          }
        } catch {
          limpiarSesion();
        }
      }
      setCargando(false);
    };
    verificarSesion();
  }, []);

  const limpiarSesion = () => {
    localStorage.removeItem('token_salon');
    localStorage.removeItem('usuario_salon');
    setUsuario(null);
  };

  const iniciarSesion = useCallback(async (idApartamento, contrasena) => {
    try {
      const respuesta = await servicioAuth.iniciarSesion(idApartamento, contrasena);
      const datos = respuesta.data;

      if (datos.exito) {
        localStorage.setItem('token_salon', datos.token);
        localStorage.setItem('usuario_salon', JSON.stringify(datos.usuario));
        setUsuario(datos.usuario);
        return { exito: true, mensaje: datos.mensaje };
      }
      return { exito: false, mensaje: 'Credenciales incorrectas' };
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'Error al iniciar sesión';
      return { exito: false, mensaje };
    }
  }, []);

  const cerrarSesion = useCallback(() => {
    limpiarSesion();
  }, []);

  const esAdmin = usuario?.rol === 'administrador';
  const esSupervisor = usuario?.rol === 'supervisor';

  return (
    <ContextoAutenticacion.Provider
      value={{ usuario, cargando, iniciarSesion, cerrarSesion, esAdmin, esSupervisor }}
    >
      {children}
    </ContextoAutenticacion.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de ProveedorAutenticacion');
  }
  return contexto;
}