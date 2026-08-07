import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EditorModal } from '../EditorModal';

describe('EditorModal', () => {
  it('debe renderizar el editor inline con el encabezado GNU nano y pie de atajos', () => {
    render(
      <EditorModal
        isOpen={true}
        filePath="/home/user/test.txt"
        initialContent="contenido de prueba"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('GNU nano 6.2')).toBeInTheDocument();
    expect(screen.getByText('/home/user/test.txt')).toBeInTheDocument();
    expect(screen.getByDisplayValue('contenido de prueba')).toBeInTheDocument();
    expect(screen.getByText(/Write Out/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Exit/i).length).toBeGreaterThan(0);
  });

  it('debe marcar como Modified al editar el texto', () => {
    render(
      <EditorModal
        isOpen={true}
        filePath="/home/user/test.txt"
        initialContent="hola"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const textarea = screen.getByDisplayValue('hola');
    fireEvent.change(textarea, { target: { value: 'hola mundo' } });

    expect(screen.getByText('Modified')).toBeInTheDocument();
  });

  it('debe llamar a onClose al presionar Ctrl+X sin modificaciones', () => {
    const handleClose = vi.fn();
    render(
      <EditorModal
        isOpen={true}
        filePath="/home/user/test.txt"
        initialContent="hola"
        onSave={vi.fn()}
        onClose={handleClose}
      />
    );

    const textarea = screen.getByDisplayValue('hola');
    fireEvent.keyDown(textarea, { key: 'x', ctrlKey: true });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('debe activar el modo Save As al presionar Ctrl+O', () => {
    render(
      <EditorModal
        isOpen={true}
        filePath="/home/user/test.txt"
        initialContent="hola"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const textarea = screen.getByDisplayValue('hola');
    fireEvent.keyDown(textarea, { key: 'o', ctrlKey: true });

    expect(screen.getByText('File Name to Write:')).toBeInTheDocument();
  });

  it('debe mostrar el mensaje de error si onSave retorna error de permisos', () => {
    const handleSave = vi.fn().mockReturnValue({ success: false, error: "nano: '/root/secret.txt': Permission denied" });
    const { container } = render(
      <EditorModal
        isOpen={true}
        filePath=""
        initialContent="contenido privado"
        onSave={handleSave}
        onClose={vi.fn()}
      />
    );

    const textarea = screen.getByDisplayValue('contenido privado');
    fireEvent.keyDown(textarea, { key: 'o', ctrlKey: true });

    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: '/root/secret.txt' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleSave).toHaveBeenCalledWith('contenido privado', '/root/secret.txt');
    expect(screen.getByText("nano: '/root/secret.txt': Permission denied")).toBeInTheDocument();
  });

  it('debe renderizar como readOnly y bloquear Ctrl+O cuando readOnly=true', () => {
    const handleSave = vi.fn();
    render(
      <EditorModal
        isOpen={true}
        filePath="/root/private.txt"
        initialContent="secreto"
        readOnly={true}
        onSave={handleSave}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Read-only/)).toBeInTheDocument();

    const textarea = screen.getByDisplayValue('secreto') as HTMLTextAreaElement;
    expect(textarea.readOnly).toBe(true);

    fireEvent.change(textarea, { target: { value: 'modificado' } });
    expect(textarea.value).toBe('secreto');

    fireEvent.keyDown(textarea, { key: 'o', ctrlKey: true });
    expect(screen.queryByText('File Name to Write:')).toBeNull();
    expect(screen.getByText('File is read-only')).toBeInTheDocument();
    expect(handleSave).not.toHaveBeenCalled();
  });

  it('debe permitir Ctrl+X en readOnly sin pedir confirmación', () => {
    const handleClose = vi.fn();
    render(
      <EditorModal
        isOpen={true}
        filePath="/root/private.txt"
        initialContent="secreto"
        readOnly={true}
        onSave={vi.fn()}
        onClose={handleClose}
      />
    );

    const textarea = screen.getByDisplayValue('secreto');
    fireEvent.keyDown(textarea, { key: 'x', ctrlKey: true });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('al salir con cambios sin guardar debe preguntar antes de pedir el nombre', () => {
    render(
      <EditorModal
        isOpen={true}
        filePath="/home/user/test.txt"
        initialContent="hola"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const textarea = screen.getByDisplayValue('hola');
    fireEvent.change(textarea, { target: { value: 'hola mundo' } });
    fireEvent.keyDown(textarea, { key: 'x', ctrlKey: true });

    expect(screen.getByText('Save modified buffer?')).toBeInTheDocument();
    expect(screen.queryByText('File Name to Write:')).toBeNull();
  });

  it('al responder No en el prompt sale sin guardar', () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();
    const { container } = render(
      <EditorModal
        isOpen={true}
        filePath="/home/user/test.txt"
        initialContent="hola"
        onSave={handleSave}
        onClose={handleClose}
      />
    );

    const textarea = screen.getByDisplayValue('hola');
    fireEvent.change(textarea, { target: { value: 'hola mundo' } });
    fireEvent.keyDown(textarea, { key: 'x', ctrlKey: true });

    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'n' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleSave).not.toHaveBeenCalled();
  });

  it('al responder Sí en el prompt pide el nombre del archivo y al confirmar guarda y sale', () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();
    const { container } = render(
      <EditorModal
        isOpen={true}
        filePath="/home/user/test.txt"
        initialContent="hola"
        onSave={handleSave}
        onClose={handleClose}
      />
    );

    const textarea = screen.getByDisplayValue('hola');
    fireEvent.change(textarea, { target: { value: 'hola mundo' } });
    fireEvent.keyDown(textarea, { key: 'x', ctrlKey: true });

    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'y' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText('File Name to Write:')).toBeInTheDocument();
    expect((container.querySelector('input') as HTMLInputElement).value).toBe('/home/user/test.txt');

    fireEvent.keyDown(container.querySelector('input')!, { key: 'Enter' });

    expect(handleSave).toHaveBeenCalledWith('hola mundo', '/home/user/test.txt');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('al cancelar el prompt con Esc vuelve a editar sin salir', () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();
    const { container } = render(
      <EditorModal
        isOpen={true}
        filePath="/home/user/test.txt"
        initialContent="hola"
        onSave={handleSave}
        onClose={handleClose}
      />
    );

    const textarea = screen.getByDisplayValue('hola');
    fireEvent.change(textarea, { target: { value: 'hola mundo' } });
    fireEvent.keyDown(textarea, { key: 'x', ctrlKey: true });

    const input = container.querySelector('input')!;
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByText('Save modified buffer?')).toBeNull();
    expect(handleClose).not.toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });
});
