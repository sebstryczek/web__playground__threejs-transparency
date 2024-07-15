const getElement = <T extends HTMLElement = HTMLElement>(selectors: string): T => {
  const element = document.querySelector<T>(selectors);

  if (element === null) {
    throw new Error(`Element not found: "${selectors}"`);
  }

  return element;
};

export { getElement };
