export function focusTrap(node: HTMLElement) {
	const focusableElementsSelector =
		'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';

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
			if (document.activeElement === firstFocusableElement) {
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

	const focusableContent = Array.from(node.querySelectorAll(focusableElementsSelector)).filter(
		(el): el is HTMLElement => el instanceof HTMLElement
	);
	if (focusableContent.length > 0) {
		focusableContent[0].focus();
	}

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeydown);
		},
	};
}
