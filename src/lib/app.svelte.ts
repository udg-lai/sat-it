import { testNavigatorAgent } from './transversal/utils.ts';

const onChromeState: boolean = $state(testNavigatorAgent());

export const onChrome = () => onChromeState;
