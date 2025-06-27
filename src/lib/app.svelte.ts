import { testNavigatorAgent } from './utils.ts';

const onChromeState: boolean = $state(testNavigatorAgent());

export const onChrome = () => onChromeState;
