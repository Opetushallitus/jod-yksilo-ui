/**
 * A function to animate an element moving to a target element.
 * @param element Element to animate
 * @param target Target element to where to move to
 * @param onAnimationComplete Callback after animation is done
 */
export const animateElementToTarget = (element: HTMLElement, target: HTMLElement, onAnimationComplete?: () => void) => {
  const sourceRect = element.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  // Create a clone of the element to animate
  const clone = element.cloneNode() as HTMLElement;
  clone.innerText = element.innerText;
  clone.ariaHidden = 'true';
  document.body.appendChild(clone);

  const startTop = sourceRect.top + globalThis.scrollY;
  const startLeft = sourceRect.left + globalThis.scrollX;
  const deltaX = targetRect.left + globalThis.scrollX - startLeft;
  const deltaY = targetRect.top + scrollY - startTop;

  Object.assign(clone.style, {
    position: 'absolute',
    top: `${startTop}px`,
    left: `${startLeft}px`,
    width: `${sourceRect.width}px`,
    height: `${sourceRect.height}px`,
    listStyleType: 'none',
    margin: 0,
    zIndex: 9999,
    pointerEvents: 'none',
    transition: ['transform 1s ease-out 0s', 'opacity 0.9s ease-out 0.2s'],
    transform: 'translate(0px, 0px) scale(1)',
    opacity: '1',
  });

  // Hide original during animation
  element.style.opacity = '0.0';

  // Animate to target using transform: translate
  clone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.9)`;
  clone.style.opacity = '0.0';

  // Remove clone after animation
  clone.addEventListener(
    'transitionend',
    () => {
      clone.remove();
      onAnimationComplete?.();
    },
    { once: true },
  );
};

/**
 * Scales and fades out an element to hide it.
 * @param element Element to hide
 * @param onAnimationComplete Callback to fire once the animation has finished
 */
export const animateHideElement = (element: HTMLElement, onAnimationComplete?: () => void) => {
  // Fade out and scale down
  Object.assign(element.style, {
    transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
    transformOrigin: 'center center',
    transform: 'scale(0)',
    opacity: '0',
    pointerEvents: 'none',
  });
  element.addEventListener(
    'transitionend',
    () => {
      onAnimationComplete?.();
    },
    { once: true },
  );
};
