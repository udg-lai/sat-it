type ActiveView = 'bookmark' | 'engine' | 'legend' | 'info';

let activeView: ActiveView = $state('bookmark');

export const getActiveView = () => activeView;

export const setActiveView = (view: ActiveView) => (activeView = view);
