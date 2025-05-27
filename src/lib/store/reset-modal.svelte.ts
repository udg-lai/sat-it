let resetModal: boolean = $state(false);

export const setResetModal = ():void => {
  resetModal = !resetModal;
}

export const getResetModal = () => resetModal;