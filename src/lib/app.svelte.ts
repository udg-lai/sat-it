import { testNavigatorAgent } from './utils/utils.ts';

const onChromeState: boolean = $state(testNavigatorAgent());

export const onChrome = () => onChromeState;
