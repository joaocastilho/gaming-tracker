export interface FocusTrapOptions {
	/**
	 * `first` focuses the first focusable control, `container` focuses the trap
	 * node itself (it must be focusable) and lets the next Tab enter the
	 * controls. Containers suit dialogs whose first control is destructive.
	 */
	initialFocus?: 'first' | 'container';
}

export function focusTrap(node: HTMLElement, options: FocusTrapOptions = {}) {
	const focusableElementsSelector =
		'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';

	const returnFocusTo =
		document.activeElement instanceof HTMLElement && document.activeElement !== document.body
			? document.activeElement
			: null;

	function handleKeydown(e: KeyboardEvent) {
		const isTabPressed = e.key === 'Tab' || e.keyCode === 9;

		if (!isTabPressed) {
			return;
		}

		const focusableContent = Array.from(node.querySelectorAll(focusableElementsSelector)).filter(
			(el): el is HTMLElement => el instanceof HTMLElement
		);
		if (focusableContent.length === 0) return;

		const firstFocusableElement = focusableContent[0];
		const lastFocusableElement = focusableContent[focusableContent.length - 1];

		if (e.shiftKey) {
			if (document.activeElement === firstFocusableElement || document.activeElement === node) {
				lastFocusableElement.focus();
				e.preventDefault();
			}
		} else {
			if (document.activeElement === lastFocusableElement) {
				firstFocusableElement.focus();
				e.preventDefault();
			}
		}
	}

	node.addEventListener('keydown', handleKeydown);

	if (options.initialFocus === 'container') {
		node.focus({ preventScroll: true });
	} else {
		const focusableContent = Array.from(node.querySelectorAll(focusableElementsSelector)).filter(
			(el): el is HTMLElement => el instanceof HTMLElement
		);
		if (focusableContent.length > 0) {
			focusableContent[0].focus();
		}
	}

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeydown);

			// Restore keyboard position to the trigger. Skipped when the trigger
			// left the document (route change) or lives inside the trap.
			if (returnFocusTo?.isConnected && !node.contains(returnFocusTo)) {
				returnFocusTo.focus({ preventScroll: true });
			}
		},
	};
}
