let lastTrailContentWidth = $state(0);

export let getLastTrailContentWidth = () => lastTrailContentWidth;

export let setLastTrailContentWidth = (width: number) => {
  lastTrailContentWidth = width;
};