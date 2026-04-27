export function focusTrap(node: HTMLElement) {
	const focusableElementsSelector =
		'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';

	function handleKeydown(e: KeyboardEvent) {
		const isTabPressed = e.key === 'Tab' || e.keyCode === 9;

		if (!isTabPressed) {
			return;
		}

		const focusableContent = node.querySelectorAll(focusableElementsSelector);
		const firstFocusableElement = focusableContent[0] as HTMLElement;
		const lastFocusableElement = focusableContent[focusableContent.length - 1] as HTMLElement;

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

	const focusableContent = node.querySelectorAll(focusableElementsSelector);
	if (focusableContent.length > 0) {
		const firstFocusableElement = focusableContent[0] as HTMLElement;
		firstFocusableElement.focus();
	}

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeydown);
		},
	};
}
