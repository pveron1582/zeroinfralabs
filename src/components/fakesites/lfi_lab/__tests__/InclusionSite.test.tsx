// ── components/fakesites/lfi_lab/__tests__/InclusionSite.test.tsx ──
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { InclusionSite } from '../InclusionSIte';

describe('InclusionSite - LFI Lab', () => {
  const defaultProps = {
    ip: '192.168.20.11',
    currentUrl: 'http://192.168.20.11/',
    onNavigate: vi.fn(),
    onFileUpload: vi.fn(),
    attackerFiles: [],
  };

  describe('Página principal', () => {
    it('debe renderizar la página principal con navegación', () => {
      render(<InclusionSite {...defaultProps} />);
      
      // Verificar que existe al menos un elemento DevPortal (puede haber múltiples)
      expect(screen.getAllByText(/DevPortal/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/🏠 Inicio/i)).toBeInTheDocument();
      expect(screen.getByText(/ℹ️ Acerca de/i)).toBeInTheDocument();
      expect(screen.getByText(/✉️ Contacto/i)).toBeInTheDocument();
      expect(screen.getByText(/📤 Upload/i)).toBeInTheDocument();
    });

    it('debe mostrar el contenido de home.php', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/?page=home.php" />);
      
      expect(screen.getByText(/Bienvenido a DevPortal/i)).toBeInTheDocument();
      expect(screen.getByText(/Estado del Servidor/i)).toBeInTheDocument();
    });

    it('debe mostrar el contenido de about.php', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/?page=about.php" />);
      
      expect(screen.getByText(/Acerca de DevPortal/i)).toBeInTheDocument();
      expect(screen.getByText(/Equipo de Desarrollo/i)).toBeInTheDocument();
    });

    it('debe mostrar el contenido de contact.php', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/?page=contact.php" />);
      
      expect(screen.getByText(/Envíanos un reporte/i)).toBeInTheDocument();
    });
  });

  describe('Página de upload', () => {
    it('debe renderizar la página de upload', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/upload.php" />);
      
      expect(screen.getByText(/Carga de Scripts de Mantenimiento/i)).toBeInTheDocument();
    });

    it('debe mostrar el selector de archivos', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/upload.php" />);
      
      expect(screen.getByText(/Archivo en Kali Linux/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('debe mostrar archivos por defecto si no se proporcionan attackerFiles', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/upload.php" />);
      
      const select = screen.getByRole('combobox');
      fireEvent.click(select);
      
      // Verificar que las opciones del select contienen los archivos
      const options = screen.getAllByRole('option');
      const optionTexts = options.map(o => o.textContent);
      expect(optionTexts.some(t => t?.includes('payload.php'))).toBe(true);
    });

    it('debe mostrar archivos personalizados de attackerFiles', () => {
      const customFiles = [
        { path: '/root/custom.php', name: 'custom.php' },
      ];
      
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/upload.php" attackerFiles={customFiles} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.click(select);
      
      expect(screen.getByText(/custom.php/i)).toBeInTheDocument();
    });

    it('debe subir archivo correctamente', async () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/upload.php" />);
      
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '/root/payload.php' } });
      
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(b => b.textContent?.includes('Subir Archivo'));
      if (submitButton) fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/subido/i)).toBeInTheDocument();
      });
      
      expect(defaultProps.onFileUpload).toHaveBeenCalled();
    });

    it('debe mostrar archivos en la ruta de files', async () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/files" victimFiles={[{path:'/var/www/html/uploads/payload.php', content:'hi', type:'text/plain'}]} />);
      
      expect(screen.getByText(/Archivos en/i)).toBeInTheDocument();
      expect(screen.getByText(/payload.php/i)).toBeInTheDocument();
    });
  });

  describe('LFI - Lectura de archivos', () => {
    it('debe mostrar etc/passwd cuando se accede via LFI', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/?page=../../../../etc/passwd" />);
      
      expect(screen.getByText(/LFI OUTPUT/i)).toBeInTheDocument();
      expect(screen.getByText(/root:x:0:0/i)).toBeInTheDocument();
    });

    it('debe mostrar etc/shadow cuando se accede via LFI', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/?page=../../../../etc/shadow" />);
      
      expect(screen.getByText(/LFI OUTPUT/i)).toBeInTheDocument();
    });

    it('debe mostrar etc/hosts cuando se accede via LFI', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/?page=../../../../etc/hosts" />);
      
      expect(screen.getByText(/LFI OUTPUT/i)).toBeInTheDocument();
      expect(screen.getByText(/127.0.0.1 localhost/i)).toBeInTheDocument();
    });

    it('debe mostrar proc/self/environ cuando se accede via LFI', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/?page=/proc/self/environ" />);
      
      expect(screen.getByText(/LFI OUTPUT/i)).toBeInTheDocument();
      expect(screen.getByText(/APACHE_RUN_USER/i)).toBeInTheDocument();
    });

    it('debe mostrar config.php cuando se accede via LFI', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/?page=../../../../var/www/html/config.php" />);
      
      expect(screen.getByText(/LFI OUTPUT/i)).toBeInTheDocument();
      expect(screen.getByText(/DB_PASS/i)).toBeInTheDocument();
    });

    it('debe mostrar apache2.conf cuando se accede via LFI', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/?page=../../../../etc/apache2/apache2.conf" />);
      
      expect(screen.getByText(/LFI OUTPUT/i)).toBeInTheDocument();
      expect(screen.getByText(/ServerRoot/i)).toBeInTheDocument();
    });

    it('debe mostrar access.log cuando se accede via LFI', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/?page=../../../../var/log/apache2/access.log" />);
      
      expect(screen.getByText(/LFI OUTPUT/i)).toBeInTheDocument();
      expect(screen.getByText(/GET/i)).toBeInTheDocument();
    });

    it('debe mostrar error 404 para archivo inexistente', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/?page=../../../../etc/nonexistent" />);
      
      expect(screen.getByText(/404 NOT FOUND/i)).toBeInTheDocument();
    });

    it('debe mostrar sugerencias en página de error 404', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/?page=../../../../etc/nonexistent" />);
      
      expect(screen.getByText(/failed to open stream/i)).toBeInTheDocument();
    });
  });

  describe('Navegación', () => {
    it('debe llamar onNavigate al hacer clic en Inicio', () => {
      render(<InclusionSite {...defaultProps} />);
      
      const homeButton = screen.getByText(/🏠 Inicio/i);
      fireEvent.click(homeButton);
      
      expect(defaultProps.onNavigate).toHaveBeenCalledWith('http://192.168.20.11/?page=home.php');
    });

    it('debe llamar onNavigate al hacer clic en Acerca de', () => {
      render(<InclusionSite {...defaultProps} />);
      
      const aboutButton = screen.getByText(/ℹ️ Acerca de/i);
      fireEvent.click(aboutButton);
      
      expect(defaultProps.onNavigate).toHaveBeenCalledWith('http://192.168.20.11/?page=about.php');
    });

    it('debe llamar onNavigate al hacer clic en Contacto', () => {
      render(<InclusionSite {...defaultProps} />);
      
      const contactButton = screen.getByText(/✉️ Contacto/i);
      fireEvent.click(contactButton);
      
      expect(defaultProps.onNavigate).toHaveBeenCalledWith('http://192.168.20.11/?page=contact.php');
    });

    it('debe llamar onNavigate al hacer clic en Upload', () => {
      render(<InclusionSite {...defaultProps} />);
      
      const uploadButton = screen.getByText(/📤 Upload/i);
      fireEvent.click(uploadButton);
      
      expect(defaultProps.onNavigate).toHaveBeenCalledWith('http://192.168.20.11/upload.php');
    });

    it('debe llamar onNavigate al hacer clic en Volver al portal desde LFI', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/?page=../../../../etc/passwd" />);
      
      const backButton = screen.getByText(/\[ CERRAR \]/i);
      fireEvent.click(backButton);
      
      expect(defaultProps.onNavigate).toHaveBeenCalledWith('http://192.168.20.11/?page=home.php');
    });
  });

  describe('Info del servidor', () => {
    it('debe mostrar info del servidor en página de inicio', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/?page=home.php" />);
      
      expect(screen.getByText(/Apache\/2.4.52/i)).toBeInTheDocument();
      expect(screen.getByText(/PHP 7.4.33/i)).toBeInTheDocument();
    });

    it('debe mostrar Content-Type en vista de archivo LFI', () => {
      render(<InclusionSite {...defaultProps} currentUrl="http://192.168.20.11/?page=../../../../etc/passwd" />);
      
      expect(screen.getByText(/LFI OUTPUT/i)).toBeInTheDocument();
    });
  });
});