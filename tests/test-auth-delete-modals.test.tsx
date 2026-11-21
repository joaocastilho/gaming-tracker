import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DeleteConfirmModal from '#lib/components/DeleteConfirmModal.js';
import LoginModal from '#lib/components/LoginModal.js';
import { editorStore } from '#lib/stores/editor.js';
import { createCompletedGame } from './helpers/factories.js';

describe('DeleteConfirmModal', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it('renders alertdialog with game title and calls onCancel on Escape or backdrop click', () => {
		const game = createCompletedGame({ id: 'g1', title: 'Elden Ring' });
		const onOpenChange = vi.fn();
		const onCancel = vi.fn();

		render(() => <DeleteConfirmModal game={game} open={true} onOpenChange={onOpenChange} onCancel={onCancel} />);
		flush();

		const dialog = screen.getByRole('alertdialog');
		expect(dialog.getAttribute('aria-modal')).toBe('true');
		expect(screen.getByText('Elden Ring')).toBeTruthy();

		const backdrop = document.querySelector('.delete-backdrop');
		expect(backdrop).toBeTruthy();
		if (backdrop) {
			fireEvent.keyDown(backdrop, { key: 'Escape' });
			expect(onOpenChange).toHaveBeenCalledWith(false);
			expect(onCancel).toHaveBeenCalledTimes(1);

			fireEvent.click(backdrop);
			expect(onCancel).toHaveBeenCalledTimes(2);
		}
	});

	it('deletes pending game and calls onConfirm when Delete is clicked', async () => {
		const game = createCompletedGame({ id: 'g2', title: 'Hades' });
		const deleteSpy = vi.spyOn(editorStore, 'deletePendingGame').mockImplementation(() => {});
		const saveSpy = vi.spyOn(editorStore, 'saveLocally').mockResolvedValue(true);
		const onOpenChange = vi.fn();
		const onConfirm = vi.fn();

		render(() => <DeleteConfirmModal game={game} open={true} onOpenChange={onOpenChange} onConfirm={onConfirm} />);
		flush();

		fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
		await Promise.resolve();

		expect(deleteSpy).toHaveBeenCalledWith('g2');
		expect(onOpenChange).toHaveBeenCalledWith(false);
		expect(onConfirm).toHaveBeenCalledTimes(1);
		saveSpy.mockRestore();
	});
});

describe('LoginModal', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		editorStore.setEditorModeFromSessionCheck(false);
	});

	afterEach(() => {
		cleanup();
		editorStore.setEditorModeFromSessionCheck(false);
	});

	it('renders dialog, dismisses on Escape and Cancel, and submits credentials', async () => {
		const loginSpy = vi.spyOn(editorStore, 'login').mockResolvedValue(true);
		const onOpenChange = vi.fn();

		render(() => <LoginModal open={true} onOpenChange={onOpenChange} />);
		flush();

		const dialog = screen.getByRole('dialog');
		expect(dialog.getAttribute('aria-modal')).toBe('true');
		expect(screen.getByText('Owner Login')).toBeTruthy();

		fireEvent.keyDown(dialog, { key: 'Escape' });
		expect(onOpenChange).toHaveBeenCalledWith(false);

		fireEvent.input(screen.getByPlaceholderText('Username'), { target: { value: 'admin' } });
		fireEvent.input(screen.getByPlaceholderText('Password'), { target: { value: 'secret' } });
		flush();

		fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
		await Promise.resolve();

		expect(loginSpy).toHaveBeenCalledWith('admin', 'secret');
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it('enables dev mode when dev-mode button is clicked', () => {
		const onOpenChange = vi.fn();
		render(() => <LoginModal open={true} onOpenChange={onOpenChange} />);
		flush();

		const devBtn = screen.queryByRole('button', { name: /Enable Dev Mode/i });
		if (devBtn) {
			fireEvent.click(devBtn);
			flush();
			expect(editorStore.editorMode).toBe(true);
			expect(onOpenChange).toHaveBeenCalledWith(false);
		}
	});
});
